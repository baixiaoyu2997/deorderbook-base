/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
import { Big } from 'big.js'
import { TradeListOption, Transaction } from 'deorderbook-sdk'

export function useTrades(params?: TradeListOption) {
  const store = useTradesStore()
  const { getCaches } = store
  const { fetchState } = toRefs(store)
  const { dobContractInfo } = toRefs(useDOBStore())
  const { bHODL, uHODL } = toRefs(useHODLStore())
  const tradesOrigin = fetchState.value(params)
  const isLoading = computed(() => tradesOrigin.value.isLoading)

  const { getTokenPrice } = useTokens()

  // [ Sniper ]
  const { formattedPools: snipers } = toRefs(usePoolsStore())
  const { getLockApy } = useApy()
  const dobApy = computedAsync(() => {
    return getLockApy(unref(dobContractInfo))
  }, '0%')
  const apyList = computed(() => {
    return tradesOrigin.value.state.map((res) => {
      let apy = null
      if (
        (res.action.startsWith('DeOrder') || res.action === 'Unstake') &&
        res.inTokens[0]?.address
      ) {
        const sniper = snipers.value.find(
          (x) => x.address === res.inTokens[0]?.address
        )
        apy = sniper?.aprString || null
      } else if (res.action === 'Lock') {
        apy = dobContractInfo.value.aprString
      } else if (
        (res.action === 'Stake' && res.outToken?.endsWith('SNIPER')) ||
        res.action === 'Collect' ||
        res.action === 'Unwind'
      ) {
        const sniper = snipers.value.find(
          (x) => x.address === res.outTokenAddress
        )
        apy = sniper?.aprString || null
      } else if (res.action === 'Claim') {
        const sniper = snipers.value.find((x) => {
          return (
            x.optionType === res.optionType &&
            x.exerciseTimestamp === res.exerciseTimestamp &&
            x.strikePrice === res.strikePrice
          )
        })
        apy = sniper?.aprString || null
      } else if (['DOBClaim', 'Withdraw'].includes(res.action)) {
        apy = dobApy.value
      } else if (res.action === 'HODLStake' && res.outToken?.endsWith('HODL')) {
        apy =
          res.outToken === 'uHODL'
            ? uHODL.value.aprString
            : bHODL.value.aprString
      }
      return apy
    })
  })
  const outTokenUSDList = computed(() => {
    return tradesOrigin.value.state.map((res) => {
      let outTokenUSD = null
      let params
      if (res.outTokenAmount !== null && res.outToken !== null) {
        if (res.strikePrice !== null && res.exerciseTimestamp !== null) {
          if (res.outToken.endsWith('SNIPER')) {
            params = {
              strikePrice: div18(res.strikePrice) as `${number}`,
              address: res.outTokenAddress!,
            }
          } else if (res.outToken.endsWith('BULLET')) {
            params = {
              strikePrice: div18(res.strikePrice) as `${number}`,
              exerciseTimestamp: res.exerciseTimestamp,
              address: res.outTokenAddress!,
            }
          }
        }
        outTokenUSD = getTokenPrice(res.outToken, params)
      }
      return outTokenUSD
    })
  })
  const outToken2USDList = computed(() => {
    return tradesOrigin.value.state.map((res) => {
      let outToken2USD = null
      let params
      if (res.outToken2Amount !== null && res.outToken2 !== null) {
        if (res.strikePrice !== null && res.exerciseTimestamp !== null) {
          if (res.outToken2.endsWith('BULLET')) {
            params = {
              strikePrice: div18(res.strikePrice) as `${number}`,
              exerciseTimestamp: res.exerciseTimestamp,
              address: res.outToken2Address!,
            }
          }
        }
        outToken2USD = getTokenPrice(res.outToken2, params)
      }
      return outToken2USD
    })
  })
  const setUnderToken = (res: Transaction) => {
    let underToken = null
    let underTokenAmount = null
    let underTokenUSD = null
    if (
      res.action.startsWith('DeOrder') &&
      res.strikePrice !== null &&
      res.inTokens[0]?.amount !== null
    ) {
      underToken = res.action === 'DeOrderSell' ? 'uHODL' : 'bHODL'
      const sniper = snipers.value.find(
        (x) => x.address === res.inTokens[0].address
      )
      if (sniper !== undefined) {
        underTokenAmount = (
          res.action === 'DeOrderSell'
            ? Big(res.inTokens[0].amount).times(div18(res.strikePrice))
            : Big(res.inTokens[0].amount).div(div18(res.strikePrice))
        ).toFixed() as `${number}`

        underTokenUSD = Big(
          res.action.startsWith('DeOrder')
            ? getTokenPrice(res.action === 'DeOrderSell' ? 'uHODL' : 'bHODL')
                .value
            : '0'
        )
          .times(div18(underTokenAmount))
          .toFixed()
      }
    }
    return {
      underToken,
      underTokenAmount,
      underTokenUSD,
    }
  }
  const setLabel = (res: Transaction) => {
    let label = res.action as FormatTrade['label']

    if (res.action === 'HODLUnstake') {
      label = 'Unstake'
    } else if (res.action.startsWith('DeOrder')) {
      label = 'DeOrder'
    } else if (res.action === 'DOBClaim' || res.action === 'HODLClaim') {
      label = 'Claim'
    } else if (res.action === 'HODLStake') {
      label = 'Stake'
    }

    return label
  }
  const setPool = (res: Transaction) => {
    let pool = null
    if (res.poolId) {
      pool = res.poolId === bHODL.value.id ? 'bHODL' : 'uHODL'
    } else if (res.action === 'HODLStake') {
      pool = res.outToken
    } else if (res.action === 'HODLUnstake') {
      pool = res.inTokens[0].token
    } else if (
      res.strikePrice !== null &&
      res.exerciseTimestamp !== null &&
      res.optionType !== null
    ) {
      pool =
        useSniperNickname({
          optionType: res.optionType,
          strikePrice: res.strikePrice,
          exerciseTimestamp: res.exerciseTimestamp,
        }) || null
    }
    return pool
  }
  const setLockUntil = (res: Transaction) => {
    let lockUntil = null
    if (res.action === 'Lock') {
      // TODO: extendLockDays应该是保存这条数据时的值，而不是取值时的值
      lockUntil = String(
        Number(res.timestamp) +
          Number(dobContractInfo.value.extendLockDurations)
      )
    }
    return lockUntil
  }
  const inTokensPrices = computed(() => {
    return tradesOrigin.value.state.map((res) => {
      return res.inTokens.map((x) => {
        let inTokenPrice = null
        if (x.amount !== null && x.token !== null) {
          // NOTE: 只有SellBULLET显示OTC价值
          if (['SellBULLET'].includes(res.action)) {
            inTokenPrice = computed(() => div18(res.bulletOTCPrice || '0'))
          } else {
            let params
            if (
              ['SNIPER', 'BULLET'].some((y) => x.token!.endsWith(y)) &&
              x.strikePrice !== null
            ) {
              params = {
                strikePrice: div18(x.strikePrice),
                address: x.address!,
                exerciseTimestamp: x.exerciseTimestamp || undefined,
              }
            }
            inTokenPrice = getTokenPrice(x.token, params)
          }
        }
        return inTokenPrice
      })
    })
  })
  const setInTokens = (res: Transaction, index: number) => {
    return res.inTokens.map((x, index2) => {
      return {
        ...x,
        usd: x.amount
          ? Big(unref(inTokensPrices.value[index][index2]) || '0')
              .times(div18(x.amount || '0'))
              .toFixed()
          : null,
      }
    })
  }
  const trades = computed<FormatTrade[]>(() => {
    return tradesOrigin.value.state.map((res, index) => {
      const { underToken, underTokenAmount, underTokenUSD } = setUnderToken(res)
      let otherAction = {}
      if (['SellBULLET'].includes(res.action)) {
        const bulletParams = {
          exerciseTimestamp: res.exerciseTimestamp!,
          strikePrice: res.strikePrice!,
          address: res.outTokenAddress!,
        }
        otherAction = {
          ...otherAction,
          bulletOTCUSD:
            res.bulletOTCBuyToken && bulletParams
              ? Big(
                  res.bulletOTCPrice
                    ? getTokenPrice(res.bulletOTCBuyToken, bulletParams).value
                    : '0'
                )
                  .times(div18(res.bulletOTCPrice || '0'))
                  .times(div18(res.outTokenAmount || '0'))
                  .toFixed()
              : null,
        }
      }
      return {
        ...res,
        label: setLabel(res),
        pool: setPool(res),
        underToken,
        underTokenAmount,
        underTokenUSD,
        outTokenUSD: res.outTokenAmount
          ? Big(outTokenUSDList.value[index]?.value || '0')
              .times(div18(res.outTokenAmount || '0'))
              .toFixed()
          : null,
        outToken2USD: res.outToken2Amount
          ? Big(outToken2USDList.value[index]?.value || '0')
              .times(div18(res.outToken2Amount || '0'))
              .toFixed()
          : null,
        inTokens: setInTokens(res, index),
        lockUntil: setLockUntil(res),
        fees: ['SellBULLET', 'BuyBULLET', 'SoldBULLET'].includes(res.action)
          ? '0'
          : res.fees,
        feesUSD:
          res.feeToken !== null
            ? computed(() => {
                return Big(div18(res.fees || '0'))
                  .times(getTokenPrice(res.feeToken!).value)
                  .toFixed()
              }).value
            : null,
        fees2USD:
          res.fee2Token !== null
            ? computed(() => {
                return Big(div18(res.fees2 || '0'))
                  .times(getTokenPrice(res.fee2Token!).value)
                  .toFixed()
              }).value
            : null,
        apy: apyList.value[index],
        bulletOTCUSD: null,
        ...otherAction,
      }
    })
  })

  return {
    tradesOrigin,
    trades,
    getCaches,
    isLoading,
  }
}
