import { defineStore } from 'pinia'
import { Pool, getSniperPoolList } from 'deorderbook-sdk'
import { Big } from 'big.js'
import dayjs from 'dayjs'
import { useOptionsStore } from '~/store/options'
import { useSniperNickname } from '~/composables/useSniperNickname'
import { useTokensStore } from '~/store/tokens'
import { onWalletReady } from '~/composables/onWalletReady'
import { FormattedPool } from '~/types/sniperPools'
import { formatPercentage } from '~/utils/number'

export const usePoolsStore = defineStore('pools', () => {
  const loading = ref(false)
  const sniperPools = ref<Pool[]>([])
  const formattedPools = ref<FormattedPool[]>([])
  const { options } = toRefs(useOptionsStore())

  let updatedAt = 0
  // TODO: set a common duration
  const updateDuration = 15 * 1000

  onWalletReady(
    () => {
      actionRefreshPools().then()
    },
    {
      status: 'setup',
    }
  )

  async function actionRefreshPools(force = false) {
    if (
      force ||
      (loading.value === false &&
        new Date().valueOf() - updatedAt >= updateDuration)
    ) {
      loading.value = true
      await getSniperPoolList()
        .then((resp) => {
          sniperPools.value = resp.filter((pool) => {
            return pool.isActive
          })
        })
        .catch((error) => {
          console.error(error)
        })
        .finally(() => {})
      updatedAt = new Date().valueOf()
      loading.value = false
    }
  }

  const {
    tokenDOB,
    tokenWBTC,
    tokenUSDC,
    tokenUSniper,
    tokenBSniper,
    actionRefreshTokensPrice,
  } = toRefs(useTokensStore())
  actionRefreshTokensPrice.value()

  watch(
    [sniperPools, tokenDOB, tokenWBTC, options],
    () => {
      if (options.value.length === 0) return
      const out: FormattedPool[] = []
      sniperPools.value.forEach((pool) => {
        const targetOption = options.value.find((option) => {
          return option.address === pool.option
        })
        if (
          targetOption &&
          dayjs(Number(targetOption.startTimestamp) * 1000).isBefore(
            dayjs().valueOf()
          )
        ) {
          const { getDeorderOriginApy } = useApy()
          const apr = getDeorderOriginApy(targetOption).value
          out.push({
            id: pool.id,
            type: targetOption.optionType === '0' ? 'bSNIPER' : 'uSNIPER',
            optionType: targetOption.optionType,
            name: useSniperNickname(targetOption) ?? '',
            address: pool.token,
            option: pool.option,
            apr,
            aprString: formatPercentage(apr),
            stakedAmount: pool.stakedAmount,
            stakedAmountUSD: Big(pool.stakedAmount)
              .mul(
                targetOption.optionType === '0'
                  ? tokenWBTC.value.priceUSD
                  : tokenUSDC.value.priceUSD
              )
              .div(
                targetOption.optionType === '0'
                  ? tokenBSniper.value.denominator
                  : tokenUSniper.value.denominator
              )
              .toFixed(),
            rewardPerBlock: pool.rewardPerBlock,
            strikePrice: targetOption.strikePrice,
            startTimestamp: targetOption.startTimestamp,
            exerciseTimestamp: targetOption.exerciseTimestamp,
          })
        }
      })
      formattedPools.value = out
    },
    {
      deep: true,
    }
  )

  return {
    loading,
    sniperPools,
    formattedPools,
    actionRefreshPools,
  }
})
