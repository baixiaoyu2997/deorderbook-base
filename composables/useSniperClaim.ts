import { ElLoading } from 'element-plus'
import { redeemRewards } from 'deorderbook-sdk/ethereum/staking_pool'
import { YMessage } from '~/utils'

export const useSniperClaim = () => {
  const claimDialogShow = ref(false)
  const sniperId = ref('')
  const openSniperClaim = (id: string) => {
    sniperId.value = id
    claimDialogShow.value = true
  }
  function claim(id = sniperId.value, callback) {
    const loadingInstance = ref(null)
    loadingInstance.value = ElLoading.service()
    redeemRewards(id)
      .then((resp) => {
        const { waitTx } = useWaitTx(resp)
        waitTx()
          .then((res) => {
            sniperId.value = ''
            callback(res)
            const { actionRefreshOptionAccounts } = toRefs(
              useOptionAccountsStore()
            )
            actionRefreshOptionAccounts.value(true)
            YMessage.success('Action Succeed')
          })
          .catch((err) => {
            if (err.code !== 4001) {
              YMessage.error(err.message)
            }
          })
          .finally(() => {
            loadingInstance.value.close()
          })
      })
      .catch((err) => {
        if (err.code !== 4001) {
          YMessage.error(err.message)
        }
        loadingInstance.value.close()
      })
  }

  return {
    claim,
    claimDialogShow,
    openSniperClaim,
  }
}
