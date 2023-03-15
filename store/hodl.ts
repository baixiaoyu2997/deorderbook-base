import { defineStore } from 'pinia'
import {
  bHODLAddress,
  getHodlPoolList,
  getUserHODLPoolList,
  HODLPool,
  uHODLAddress,
} from 'deorderbook-sdk'
import dayjs from 'dayjs'
import { getHODLPoolRewardAmount } from 'deorderbook-sdk/ethereum/hodl_pool_rewarder'
import { Big } from 'big.js'
import { FormattedHODLPool, FormattedUserHODLPool } from '@/types/hodl'
import { onWalletReady } from '~/composables/onWalletReady'
import { useTokensStore } from '~/store/tokens'
import { formatPercentage } from '~/utils/number'

const defaultUHODL = {
  id: '',
  token: uHODLAddress.toLowerCase(),
  option: '',
  startBlock: '',
  endBlock: '',
  rewardPerBlock: '0',
  stakedAmount: '0',
  type: 'uHODL',
  name: 'uHODL',
  apr: '0',
  aprString: '0',
  stakedAmountUSD: '0',
}
const defaultBHODL = {
  id: '',
  token: bHODLAddress.toLowerCase(),
  option: '',
  startBlock: '',
  endBlock: '',
  rewardPerBlock: '0',
  stakedAmount: '0',
  type: 'bHODL',
  name: 'bHODL',
  apr: '0',
  aprString: formatPercentage('0'),
  stakedAmountUSD: '0',
}
const defaultUserUHODL = {
  id: '',
  poolId: '',
  account: '',
  staked: '0',
  token: '',
  type: 'uHODL',
  stakedUSD: '0',
  balance: '0',
  balanceUSD: '0',
  rewardDOBAmount: '0',
  rewardDOBAmountUSD: '0',
  apr: '0',
  aprString: formatPercentage('0'),
}
const defaultUserBHODL = {
  id: '',
  poolId: '',
  account: '',
  staked: '0',
  token: '',
  type: 'bHODL',
  stakedUSD: '0',
  balance: '0',
  balanceUSD: '0',
  rewardDOBAmount: '0',
  rewardDOBAmountUSD: '0',
  apr: '0',
  aprString: formatPercentage('0'),
}
export const useHODLStore = defineStore('hodl', () => {
  const wallet = useWalletStore()
  const uHODL = ref<FormattedHODLPool>(defaultUHODL)
  const bHODL = ref<FormattedHODLPool>(defaultBHODL)
  const userUHODL = ref<FormattedUserHODLPool>(defaultUserUHODL)
  const userBHODL = ref<FormattedUserHODLPool>(defaultUserBHODL)
  const hodlPools = computed(() => {
    return [uHODL.value, bHODL.value]
  })
  const userHODLPools = computed(() => {
    return [userUHODL.value, userBHODL.value]
  })
  const loading = ref(false)
  let lastUpdateTimestamp = 0
  const updateDuration = 15 * 1000

  onWalletReady(
    () => {
      actionRefreshHODLPools().then()
    },
    {
      status: 'setup',
    }
  )

  watch(hodlPools, () => {
    if (wallet.address !== '') {
      getUserHODLPoolList(wallet.address)
        .then(async (res) => {
          for (const targetPool of hodlPools.value) {
            let one = res.find((userHODLPool) => {
              return targetPool.id === userHODLPool.poolId
            })
            if (one === undefined) {
              one = {
                id: `${targetPool.id}_${wallet.address}`,
                poolId: targetPool.id,
                account: wallet.address,
                staked: '0',
              }
            }
            const userBalance =
              targetPool.token === uHODLAddress.toLowerCase()
                ? wallet.tokenBalance.balanceUHODL
                : wallet.tokenBalance.balanceBHODL

            const reward = await getHODLPoolRewardAmount(one.poolId)
            const tmp: FormattedUserHODLPool = {
              ...one,
              token: targetPool.token,
              type:
                targetPool.token === uHODLAddress.toLowerCase()
                  ? 'uHODL'
                  : 'bHODL',
              stakedUSD: Big(one.staked)
                .mul(
                  targetPool.token === uHODLAddress.toLowerCase()
                    ? tokenUSDC.value.priceUSD
                    : tokenWBTC.value.priceUSD
                )
                .div(
                  targetPool.token === uHODLAddress.toLowerCase()
                    ? tokenUHODL.value.denominator
                    : tokenBHODL.value.denominator
                )
                .toFixed(),
              balance: userBalance,
              balanceUSD: Big(userBalance)
                .mul(
                  targetPool.token === uHODLAddress.toLowerCase()
                    ? tokenUSDC.value.priceUSD
                    : tokenWBTC.value.priceUSD
                )
                .div(
                  targetPool.token === uHODLAddress.toLowerCase()
                    ? tokenUHODL.value.denominator
                    : tokenBHODL.value.denominator
                )
                .toFixed(),
              apr: targetPool.apr ?? '0',
              aprString: targetPool.aprString,
              rewardDOBAmount: reward.toString(),
              rewardDOBAmountUSD: Big(reward.toString())
                .mul(tokenDOB.value.priceUSD)
                .div(tokenDOB.value.denominator)
                .toFixed(),
            }
            if (targetPool.type === 'uHODL') {
              userUHODL.value = tmp
            } else {
              userBHODL.value = tmp
            }
          }
        })
        .catch((error) => {
          console.error(error)
        })
    }
  })
  // when uHODL or bHODL balance change ,should update userUHODL and userBHODL
  watch(
    () => wallet.tokenBalance.balanceUHODL,
    (newValue) => {
      userUHODL.value.balance = newValue
      userUHODL.value.balanceUSD = Big(newValue)
        .mul(tokenUSDC.value.priceUSD)
        .div(tokenUHODL.value.denominator)
        .toFixed()
    }
  )
  // when uHODL or bHODL balance change ,should update userUHODL and userBHODL
  watch(
    () => wallet.tokenBalance.balanceBHODL,
    (newValue) => {
      userBHODL.value.balance = newValue
      userBHODL.value.balanceUSD = Big(newValue)
        .mul(tokenWBTC.value.priceUSD)
        .div(tokenBHODL.value.denominator)
        .toFixed()
    }
  )

  async function actionRefreshHODLPools(force = false) {
    if (
      force ||
      (loading.value === false &&
        new Date().valueOf() - lastUpdateTimestamp >= updateDuration)
    ) {
      loading.value = true
      await getHodlPoolList()
        .then((res) => {
          res.forEach((pool) => {
            const apr = _calcApr(pool)
            const tmp: FormattedHODLPool = {
              ...pool,
              type:
                pool.token === uHODLAddress.toLowerCase() ? 'uHODL' : 'bHODL',
              name:
                pool.token === uHODLAddress.toLowerCase() ? 'uHODL' : 'bHODL',
              stakedAmountUSD: Big(pool.stakedAmount)
                .mul(
                  pool.token === uHODLAddress.toLowerCase()
                    ? tokenUHODL.value.priceUSD
                    : tokenBHODL.value.priceUSD
                )
                .div(
                  pool.token === uHODLAddress.toLowerCase()
                    ? tokenUHODL.value.denominator
                    : tokenBHODL.value.denominator
                )
                .toFixed(),
              apr,
              aprString: formatPercentage(apr),
            }
            if (pool.token === uHODLAddress.toLowerCase()) {
              uHODL.value = tmp
            } else {
              bHODL.value = tmp
            }
          })
        })
        .catch((error) => {
          console.error(error)
        })
      lastUpdateTimestamp = dayjs().valueOf()
      loading.value = false
    }
  }

  const { tokenDOB, tokenUSDC, tokenWBTC, tokenUHODL, tokenBHODL } = toRefs(
    useTokensStore()
  )

  function _calcApr(pool: HODLPool): string {
    const rewardUSD = Big(pool.rewardPerBlock)
      .div(tokenDOB.value.denominator)
      .times(24 * 60 * 5 * 365)
      .times(tokenDOB.value.priceUSD)
    const stakedUSD = Big(pool.stakedAmount)
      .div(
        pool.token === uHODLAddress.toLowerCase()
          ? tokenUSDC.value.denominator
          : tokenWBTC.value.denominator
      )
      .times(
        pool.token === uHODLAddress.toLowerCase()
          ? tokenUSDC.value.priceUSD
          : tokenWBTC.value.priceUSD
      )
    let apr = Big(100000)
    if (stakedUSD.gt(0)) {
      apr = rewardUSD.div(stakedUSD).mul(100)
    }
    return apr.toFixed()
  }

  return {
    uHODL,
    bHODL,
    userUHODL,
    userBHODL,
    hodlPools,
    userHODLPools,
    actionRefreshHODLPools,
  }
})
