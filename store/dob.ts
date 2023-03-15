import { defineStore } from 'pinia'
import {
  dailyTotalShareBullet,
  DOBRewardItem,
  extendLockDays as apiExtendLockDays,
  feeCollector,
  getBulletRewardThreshold,
  getHODLReward,
  getReward,
  getSniperReward,
  poolData,
  rewardDispatcher,
  userDatas,
  isCheckNFT as apiIsCheckNFT,
  stakingInfo,
  lastDeliverEndBlock as apiLastDeliverEndBlock,
  activatedOptionLength,
  activatedOptions,
  lastPeriodDailyTotalShareBullet,
  userClaimInfo as apiUserClaimInfo,
  lastWorkTimestamp as apiLastWorkTimestamp,
  lastDeliverStartBlock as apiLastDeliverStartBlock,
} from 'deorderbook-sdk/ethereum/dob_staking_pool'
import { Big } from 'big.js'
import { BaseTokenSymbol } from 'deorderbook-sdk/ethereum/token_provider'
import { balanceOf } from 'deorderbook-sdk/ethereum/hodl'
import dayjs from 'dayjs'
import { totalSupply } from 'deorderbook-sdk/ethereum/dob'
import { onWalletReady } from '~/composables/onWalletReady'
import { DOBContractInfo, DOBUserInfo } from '~/types/dob'
import { formatPercentage } from '~/utils/number'

/**
 * Stake xHODL, xSNIPER reward DOB.
 */
export const useDOBRewardStore = defineStore('dobReward', () => {
  const rewardItems = ref<DOBRewardItem[]>([])
  const loading = ref(false)
  let updatedAt = 0
  // TODO: set a common duration
  const updateDuration = 15 * 1000

  onWalletReady(() => {
    actionRefreshItems()
  })

  const allRewardAmount = ref('0')
  const hodlRewardAmount = ref('0')
  const sniperRewardAmount = ref('0')
  const activatedOption = ref(
    [] as Awaited<ReturnType<typeof activatedOptions>>[]
  )

  function _getRewardAmount(type: 'all' | 'snipers' | 'hodls' = 'all'): string {
    let amount = Big(0)
    rewardItems.value?.forEach((item) => {
      if (type === 'all') {
        amount = amount.add(Big(item.rewardAmount))
      } else if (
        type === 'snipers' &&
        (item.from === BaseTokenSymbol.USNIPER ||
          item.from === BaseTokenSymbol.BSNIPER)
      ) {
        amount = amount.add(Big(item.rewardAmount))
      } else if (
        type === 'hodls' &&
        (item.from === BaseTokenSymbol.UHODL ||
          item.from === BaseTokenSymbol.BHODL)
      ) {
        amount = amount.add(Big(item.rewardAmount))
      }
    })
    return amount.toFixed()
  }

  function getClaimableItems(): DOBRewardItem[] {
    return rewardItems.value.filter((item) => {
      return Big(item.rewardAmount).gt(0)
    })
  }

  // [ Worker ]
  const lastDeliverStartBlock = ref('0')
  const lastDeliverEndBlock = ref('0')

  // 用户上一次claim所在的block
  const userClaimBlock = ref('0')

  async function actionRefreshItems(force = false) {
    if (
      force ||
      (loading.value === false &&
        new Date().valueOf() - updatedAt >= updateDuration)
    ) {
      loading.value = true
      const uHODLRewardItem = getHODLReward(BaseTokenSymbol.UHODL)
      const bHODLRewardItem = getHODLReward(BaseTokenSymbol.BHODL)
      const sniperRewardItems = getSniperReward()

      const optionsPList = await activatedOptionLength().then((length) => {
        return new Promise((resolve, reject) => {
          const pList = [] as ReturnType<typeof activatedOptions>[]
          for (let i = 0; i < length.toNumber(); i++) {
            pList.push(activatedOptions(i))
          }
          Promise.all(pList)
            .then((res) => {
              resolve(res)
            })
            .catch((err) => {
              reject(err)
            })
        })
      })

      Promise.all([
        bHODLRewardItem,
        uHODLRewardItem,
        sniperRewardItems,
        optionsPList,
        apiLastDeliverStartBlock(),
        apiLastDeliverEndBlock(),
        apiUserClaimInfo(),
      ])
        .then((res) => {
          lastDeliverStartBlock.value = res[4].toString()
          lastDeliverEndBlock.value = res[5].toString()
          userClaimBlock.value = res[6].toString()

          const list: DOBRewardItem[] = []
          list.push(res[0])
          list.push(res[1])
          list.push(...res[2])
          rewardItems.value = list
          const _hodlRewardAmount = Big(res[0].rewardAmount).add(
            res[1].rewardAmount
          )
          hodlRewardAmount.value = _hodlRewardAmount.toFixed()
          let _sniperRewardAmount = Big(0)
          res[2].forEach((sniperReward: DOBRewardItem) => {
            _sniperRewardAmount = _sniperRewardAmount.add(
              sniperReward.rewardAmount
            )
          })
          sniperRewardAmount.value = _sniperRewardAmount.toFixed()
          allRewardAmount.value = Big(_hodlRewardAmount)
            .add(_sniperRewardAmount)
            .toFixed()
          activatedOption.value = res[3] as Awaited<
            ReturnType<typeof activatedOptions>
          >[]
        })
        .catch((error) => {
          console.error(error)
        })
        .finally(() => {
          updatedAt = new Date().valueOf()
          loading.value = false
        })
    }
  }

  return {
    loading,
    lastDeliverStartBlock,
    lastDeliverEndBlock,
    rewardItems,
    activatedOption,
    getClaimableItems,
    allRewardAmount,
    hodlRewardAmount,
    userClaimBlock,
    sniperRewardAmount,
    actionRefreshItems,
  }
})

/**
 * dob store
 */
export const useDOBStore = defineStore('dob', () => {
  // 上个周期worker运行时间，当前周期运行时间合约限制为不小于 lastWorkTimestamp + 23h
  const lastWorkTimestamp = computedAsync(async () => {
    return await apiLastWorkTimestamp().then((res) => res.toString())
  }, '0')

  const { address } = useAccount()
  // 当前合约是否支持NFT
  const isCheckNFT = computedAsync(async () => {
    return await apiIsCheckNFT()
  }, false)

  const dobContractInfo = ref<DOBContractInfo>({
    totalSupply: '0',
    collectorAddress: '',
    rewardDispatchAddress: '',
    bulletRewardThreshold: '0',
    extendLockDurations: '0',
    totalStake: '0',
    totalDailyLockDOB: '0',
    lastPeriodTotalDailyLockDOB: '0',
    collectorUHODLBalance: '0',
    collectorBHODLBalance: '0',
    rewardDispatchUHODLBalance: '0',
    rewardDispatchBHODLBalance: '0',
    totalBHODLRewardUSD: '0',
    totalUHODLRewardUSD: '0',
    apr: '0',
    aprString: '0%',
  } as DOBContractInfo)

  // user info
  const userInfo = ref<DOBUserInfo>({
    dailyStakingAmount: '0',
    totalStakingAmount: '0',
    uHODLEntryAccuReward: '0',
    bHODLEntryAccuReward: '0',
    lastEntryTimestamp: '0',
    bHODLReward: '0',
    uHODLReward: '0',
  } as DOBUserInfo)

  onBeforeMount(() => {
    actionRefreshDOBContractInfo().then()
  })

  onWalletReady(() => {
    actionRefreshUserDOBInfo().then()
  })

  let userDOBInfoLastUpdateTimestamp = 0
  const userDOBInfoLoading = ref(false)
  async function actionRefreshUserDOBInfo(force = false) {
    if (address.value === '') {
      return
    }
    if (!force) {
      if (dayjs().valueOf() - userDOBInfoLastUpdateTimestamp <= 15000) {
        return
      }
      if (userDOBInfoLoading.value) {
        return
      }
    }

    userDOBInfoLoading.value = true
    const info: DOBUserInfo = {} as DOBUserInfo
    await Promise.all([
      userDatas(),
      getReward(),
      stakingInfo(),
      apiLastDeliverEndBlock(),
    ])
      .then((res) => {
        const [userData, userReward, stakingInfo, lastDeliverEndBlock] = res

        // dailyStakingAmount calc logic from xy
        if (
          stakingInfo.stakingAmountUpdateBlockHeight.toNumber() >
          lastDeliverEndBlock.toNumber()
        ) {
          info.dailyStakingAmount = stakingInfo.currentStakingAmount.toString()
        } else {
          info.dailyStakingAmount = '0'
        }
        info.claimStakingAmount = stakingInfo.claimStakingAmount.toString()
        info.claimAmountUpdateBlockHeight =
          stakingInfo.claimAmountUpdateBlockHeight.toString()
        info.currentStakingAmount = stakingInfo.currentStakingAmount.toString()
        info.stakingAmountUpdateBlockHeight =
          stakingInfo.stakingAmountUpdateBlockHeight.toString()
        info.totalStakingAmount = userData.totalStakingAmount.toString()
        info.uHODLEntryAccuReward = userData.uHODLEntryAccuReward.toString()
        info.bHODLEntryAccuReward = userData.bHODLEntryAccuReward.toString()
        info.lastEntryTimestamp = userData.lastEntryTime.toString()
        info.uHODLReward = userReward.uHODLReward.toString()
        info.bHODLReward = userReward.bHODLReward.toString()

        userInfo.value = info
      })
      .finally(() => {
        userDOBInfoLoading.value = false
        userDOBInfoLastUpdateTimestamp = dayjs().valueOf()
      })
  }

  let dobContractInfoLastUpdateTimestamp = 0
  const dobContractInfoLoading = ref(false)
  async function actionRefreshDOBContractInfo(force = false) {
    if (!force) {
      if (dayjs().valueOf() - dobContractInfoLastUpdateTimestamp <= 15000) {
        return
      }
      if (dobContractInfoLoading.value) {
        return
      }
    }
    dobContractInfoLoading.value = true
    const info: DOBContractInfo = {} as DOBContractInfo
    await Promise.all([feeCollector(), rewardDispatcher()]).then((res) => {
      const [feeCollector, rewardDispatcher] = res
      info.collectorAddress = feeCollector
      info.rewardDispatchAddress = rewardDispatcher.toString()
    })
    await Promise.all([
      totalSupply(),
      getBulletRewardThreshold(),
      apiExtendLockDays(),
      poolData(),
      dailyTotalShareBullet(),
      balanceOf('uHODL', info.collectorAddress),
      balanceOf('bHODL', info.collectorAddress),
      balanceOf('uHODL', info.rewardDispatchAddress),
      balanceOf('bHODL', info.rewardDispatchAddress),
      lastPeriodDailyTotalShareBullet(), // TODO: 不需要放在一起获取，只有在useBulletReward中使用
    ])
      .then(async (res) => {
        const { getLockOriginApy } = useApy()
        const [
          totalSupply,
          bulletRewardThreshold,
          extendLockDurations,
          poolData,
          totalDailyLockDOB,
          collectorUHodl,
          collectorBHodl,
          dispatcherUHodl,
          dispatcherBHodl,
          lastPeriodTotalDailyLockDOB,
        ] = res

        info.totalSupply = totalSupply.toString()
        info.bulletRewardThreshold = bulletRewardThreshold.toString()
        info.extendLockDurations = extendLockDurations.toString()
        info.totalStake = poolData.stakingAmount.toString()
        info.totalDailyLockDOB = totalDailyLockDOB.toString()
        info.lastPeriodTotalDailyLockDOB =
          lastPeriodTotalDailyLockDOB.toString()
        info.collectorUHODLBalance = collectorUHodl.toString()
        info.collectorBHODLBalance = collectorBHodl.toString()
        info.rewardDispatchUHODLBalance = dispatcherUHodl.toString()
        info.rewardDispatchBHODLBalance = dispatcherBHodl.toString()
        info.totalUHODLRewardUSD = Big(collectorUHodl.toString())
          .add(dispatcherUHodl.toString())
          .toFixed()
        info.totalBHODLRewardUSD = Big(collectorBHodl.toString())
          .add(dispatcherBHodl.toString())
          .toFixed()
        info.apr = await getLockOriginApy(info)
        info.aprString = formatPercentage(info.apr)

        dobContractInfo.value = info
      })
      .finally(() => {
        dobContractInfoLoading.value = false
        dobContractInfoLastUpdateTimestamp = dayjs().valueOf()
      })
  }

  return {
    userInfo,
    isCheckNFT,
    dobContractInfo,
    dobContractInfoLoading,
    actionRefreshUserDOBInfo,
    actionRefreshDOBContractInfo,
    lastWorkTimestamp,
  }
})
