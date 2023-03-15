import { UseAsyncStateReturn } from '@vueuse/core'
import {
  optionBulletToRewardRatio,
  optionExerciseFeeRatio,
  optionRedeemFeeRatio,
  optionWithdrawFeeRatio,
} from 'deorderbook-sdk/ethereum/option'
import { defineStore } from 'pinia'

/**
 * options fees
 */
export const useOptionFeeStore = defineStore('optionFee', () => {
  // useMemo在导出store时应该传递给ref，防止篡改useMemoize返回值

  const {
    fetchState: fetchRedeemFeeRatioState,
    refreshAllState: refreshRedeemFeeRatioAllState,
  } = useActionCache(
    (...args) => {
      return optionRedeemFeeRatio(args[0] as string)
        .then((res: number) => (res ? Number(res) / 10000 : 0))
        .catch((err) => {
          console.error(err)
        })
    },
    0,
    {
      interval: Number.MAX_SAFE_INTEGER,
    }
  )

  const {
    fetchState: fetchBulletToRewardRatio,
    refreshAllState: refreshAllBulletToRewardRatio,
  } = useActionCache(
    (...args) => {
      return optionBulletToRewardRatio(args[0] as string)
        .then((res: number) => (res ? Number(res) / 10000 : 0))
        .catch((err) => {
          console.error(err)
        })
    },
    0,
    {
      interval: Number.MAX_SAFE_INTEGER,
    }
  )

  const {
    fetchState: fetchExerciseFeeRatio,
    refreshAllState: refreshAllExerciseFeeRatio,
  } = useActionCache(
    (...args) => {
      return optionExerciseFeeRatio(args[0] as string)
        .then((res: number) => (res ? Number(res) / 10000 : 0))
        .catch((err) => {
          console.error(err)
        })
    },
    0,
    {
      interval: Number.MAX_SAFE_INTEGER,
    }
  )

  const {
    fetchState: fetchWithdrawFeeRatio,
    refreshAllState: refreshAllWithdrawFeeRatio,
  } = useActionCache(
    (...args) => {
      return optionWithdrawFeeRatio(args[0] as string)
        .then((res: number) => (res ? Number(res) / 10000 : 0))
        .catch((err) => {
          console.error(err)
        })
    },
    0,
    {
      interval: Number.MAX_SAFE_INTEGER,
    }
  )

  return {
    fetchRedeemFeeRatioState,
    refreshRedeemFeeRatioAllState,
    fetchBulletToRewardRatio,
    refreshAllBulletToRewardRatio,
    fetchExerciseFeeRatio,
    refreshAllExerciseFeeRatio,
    fetchWithdrawFeeRatio,
    refreshAllWithdrawFeeRatio,
  }
})
