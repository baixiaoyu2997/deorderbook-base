import { redeemReward } from 'deorderbook-sdk/ethereum/dob_staking_pool'
import { YMessage } from '~/utils'
import { useWaitTx } from '~/composables/useWaitTx'
/**
 * @description 用来领取lock dob所获取的bHODL和uHODL
 * @notice 只支持全部领取，不支持分别领取
 */
export const useDOBClaim = (cb?: () => unknown) => {
  const { actionRefreshUserDOBInfo, actionRefreshDOBContractInfo } = toRefs(
    useDOBStore()
  )
  const claimVisible = ref(false)
  const onClickClaim = () => {
    claimVisible.value = true
  }
  const loading = useLoading()

  const claim = () => {
    loading.show()
    redeemReward()
      .then(async (resp) => {
        const { waitTx } = useWaitTx(resp)
        await waitTx()
          .then((res) => {
            if (res) {
              actionRefreshDOBContractInfo.value(true)
              actionRefreshUserDOBInfo.value(true)
              YMessage.success('Action Succeed')
              claimVisible.value = false
              cb?.()
            }
          })
          .catch((error) => {
            if (error.code !== 4001) {
              YMessage.error(error.message)
            }
          })
      })
      .finally(() => {
        loading.hide()
      })
  }
  return {
    claimVisible,
    onClickClaim,
    claim,
  }
}
