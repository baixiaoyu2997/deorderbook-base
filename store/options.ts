import { defineStore } from 'pinia'
import { Option, getOptions } from 'deorderbook-sdk'
import dayjs from 'dayjs'
import { useWalletStore } from './wallet'
import { onWalletReady } from '~/composables/onWalletReady'
import { OptionFee } from '~/types/options'

export const useOptionsStore = defineStore('options', () => {
  const wallet = useWalletStore()
  const loading = ref(false)
  const options = ref<Option[]>([])
  const optionFeeRate = ref<OptionFee>(new OptionFee())
  let updatedAt = 0
  // TODO: set a common duration
  const updateDuration = 15 * 1000

  onWalletReady(
    () => {
      actionRefreshOptions().then()
    },
    {
      status: 'setup',
    }
  )

  async function actionRefreshOptions(force = false) {
    if (
      force ||
      (loading.value === false &&
        new Date().valueOf() - updatedAt >= updateDuration)
    ) {
      loading.value = true
      await getOptions()
        .then((resp) => {
          options.value = resp.filter((option) => {
            return dayjs(Number(option.startTimestamp) * 1000).isBefore(dayjs())
          })
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
    options,
    actionRefreshOptions,
  }
})
