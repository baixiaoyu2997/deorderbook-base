import { defineStore } from 'pinia'
import { getOptionAccountListByAddress, OptionAccount } from 'deorderbook-sdk'
import { Big } from 'big.js'
import { getReward } from 'deorderbook-sdk/ethereum/staking_pool_rewarder'
import { useWalletStore } from './wallet'
import { useOptionsStore } from '~/store/options'
import { usePoolsStore } from '~/store/pools'
import { useSniperNickname } from '~/composables/useSniperNickname'
import { useTokensStore } from '~/store/tokens'
import { div18 } from '~/utils'
import { onWalletReady } from '~/composables/onWalletReady'
import { FormattedBullet, FormattedOptionAccount } from '~/types/options'
import useTokens from '~/composables/useTokens'

export const useOptionAccountsStore = defineStore('optionAccounts', () => {
  const wallet = useWalletStore()
  const loading = ref(false)
  const optionAccounts = ref<OptionAccount[]>([])
  let updatedAt = 0
  // TODO: set a common duration
  const updateDuration = 15 * 1000
  const { options } = toRefs(useOptionsStore())
  const { formattedPools } = toRefs(usePoolsStore())
  const { getTokenPrice } = useTokens()
  const {
    tokenDOB,
    tokenUSniper,
    tokenBSniper,
    tokenUBullet,
    tokenBBullet,
    getSniperPrice,
    getBulletPrice,
  } = toRefs(useTokensStore())
  const formattedUserSnipers = ref<FormattedOptionAccount[]>([])
  const formattedUserBullets = ref<FormattedBullet[]>([])

  onWalletReady(() => {
    actionRefreshOptionAccounts().then()
  })

  watch(
    [optionAccounts, options, formattedPools],
    async () => {
      let outOption: FormattedOptionAccount[] = []
      const outBullet: FormattedBullet[] = []
      // dob reward promise list
      const dobRewardPList = []
      for (const one of optionAccounts.value) {
        const targetOption = options.value.find((option) => {
          return option.id === one.optionId
        })
        const targetSniperPool = formattedPools.value.find((pool) => {
          return pool.option === targetOption?.address
        })

        if (targetOption && targetSniperPool) {
          dobRewardPList.push(getReward(targetSniperPool.id))

          outOption.push({
            id: targetSniperPool.id,
            optionID: targetOption.id,
            type: targetOption.optionType === '1' ? 'uSNIPER' : 'bSNIPER',
            optionType: targetOption.optionType,
            name: useSniperNickname(targetOption) ?? '',
            strikePrice: targetOption.strikePrice,
            stakedAmount: one.stakedSniper,
            stakedAmountUSD: div18(
              Big(one.stakedSniper).mul(
                targetOption.optionType === '1'
                  ? tokenUSniper.value.priceUSD
                  : tokenBSniper.value.priceUSD
              )
            ),
            matchingBulletAmount: one.totalBullet,
            matchingBulletAmountUSD: div18(
              Big(one.totalBullet).mul(
                targetOption.optionType === '1'
                  ? tokenUBullet.value.priceUSD
                  : tokenBBullet.value.priceUSD
              )
            ),
            matchingSniperAmount: one.totalSniper,
            matchingSniperAmountUSD: div18(
              Big(one.totalSniper).mul(
                targetOption.optionType === '1'
                  ? tokenUSniper.value.priceUSD
                  : tokenBSniper.value.priceUSD
              )
            ),
            matchingAllSniperAmount: Big(one.totalSniper)
              .plus(one.stakedSniper)
              .toFixed(),
            startTimestamp: targetOption.startTimestamp,
            exerciseTimestamp: targetOption.exerciseTimestamp,
            expiryTimestamp: (
              Number(targetOption.exerciseTimestamp) + 86400
            ).toString(),
            apr: targetSniperPool.apr,
            aprString: targetSniperPool.aprString,
            claimableDOBAmount: '0',
            claimableDOBAmountUSD: '0',
            sniper: targetOption.sniper,
            bullet: targetOption.bullet,
            address: targetOption.address,
          })
          outBullet.push({
            id: targetSniperPool.id,
            optionType: targetOption.optionType,
            type: targetOption.optionType === '1' ? 'uBULLET' : 'bBULLET',
            name: useSniperNickname(targetOption) ?? '',
            amount: one.totalBullet,
            amountUSD: div18(
              Big(one.totalBullet).mul(
                targetOption.optionType === '1'
                  ? tokenUBullet.value.priceUSD
                  : tokenBBullet.value.priceUSD
              )
            ),
            strikePrice: targetOption.strikePrice,
            startTimestamp: targetOption.startTimestamp,
            exerciseTimestamp: targetOption.exerciseTimestamp,
            bullet: targetOption.bullet,
            address: targetOption.address,
          })
        }
      }
      await Promise.all(dobRewardPList).then((dobRewardAmountList) => {
        // 添加sniper的dob奖励
        outOption = outOption.map((x, index) => {
          x.claimableDOBAmount = dobRewardAmountList[index].toString()
          x.claimableDOBAmountUSD = div18(
            Big(dobRewardAmountList[index].toString()).mul(
              tokenDOB.value.priceUSD
            )
          )
          return x
        })
        formattedUserSnipers.value = outOption.sort((a, b) => {
          return Number(b.exerciseTimestamp) - Number(a.exerciseTimestamp)
        })
        formattedUserBullets.value = outBullet.sort((a, b) => {
          return Number(b.exerciseTimestamp) - Number(a.exerciseTimestamp)
        })
        loading.value = false
      })
    },
    {
      deep: true,
    }
  )

  function getFormattedOptionAccountBy(
    optionAddress: string
  ): FormattedOptionAccount | undefined {
    const target = formattedUserSnipers.value.find((one) => {
      if (one.address === optionAddress) {
        return true
      }
      return false
    })
    return target
  }

  async function actionRefreshOptionAccounts(force = false) {
    if (wallet.address === '') {
      return
    }
    if (
      force ||
      (loading.value === false &&
        new Date().valueOf() - updatedAt >= updateDuration)
    ) {
      loading.value = true
      await getOptionAccountListByAddress(wallet.address)
        .then((resp) => {
          optionAccounts.value = resp
        })
        .catch(() => {
          loading.value = false
        })
        .finally(() => {
          updatedAt = new Date().valueOf()
        })
    }
  }

  return {
    loading,
    optionAccounts,
    formattedUserSnipers,
    formattedUserBullets,
    getFormattedOptionAccountBy,
    actionRefreshOptionAccounts,
  }
})
