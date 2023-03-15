import { Big } from 'big.js'
import { stake as hodlPoolStake } from 'deorderbook-sdk/ethereum/hodl_pool'
import { YMessage } from '~/utils'
/**
 * hodl stake 相关逻辑
 */
export const useHODLStake = (cb?: (symbol: 'bHODL' | 'uHODL') => unknown) => {
  const loading = useLoading()

  const { txWithApprove } = useWallet()
  const { userBHODL, userUHODL, actionRefreshHODLPools } = toRefs(
    useHODLStore()
  )

  const stakeVisible = ref(false)
  const stakeObj = reactive({
    amount: '0',
    hodlSymbol: '' as 'bHODL' | 'uHODL',
    item: {
      wallet: '',
      title: '',
      max: 0,
    },
  })
  /**
   * @description hodl stake, v1版本使用时不需要加参数，但是需要先调用openHODLStake,v2带参数就不用调用openHODLStake
   * @param {('bHODL' | 'uHODL')} symbol hodl token type
   * @param {string} amount hodl token amount,带精度的值
   */
  const startStake = (symbol?: 'bHODL' | 'uHODL', amount?: string) => {
    loading.show()
    const hodlAmount =
      amount ?? Big(10).pow(18).times(stakeObj.amount).toFixed()
    const hodlSymbol = symbol ?? stakeObj.hodlSymbol

    const hodlData = symbol === 'bHODL' ? userBHODL : userUHODL
    const hodlPoolAddress = hodlData.value.token
    const poolId = hodlData.value.poolId

    return txWithApprove(hodlSymbol, hodlPoolAddress, () =>
      hodlPoolStake(poolId, hodlAmount)
    )
      .then((bool) => {
        if (bool) {
          YMessage.success('Action Succeeded')
          stakeVisible.value = false
          actionRefreshHODLPools.value(true)
          cb?.(hodlSymbol)
        }
      })
      .catch((err) => {
        if (err.code !== 4001) {
          YMessage.error(err.message)
        }
        return Promise.reject(err)
      })
      .finally(() => {
        loading.hide()
      })
  }

  return {
    stakeVisible,
    stakeObj,
    startStake,
  }
}
