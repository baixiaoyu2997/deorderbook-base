import { Big } from 'big.js'
import { unstake as hodlPoolUnstake } from 'deorderbook-sdk/ethereum/hodl_pool'

export const useHODLUnStake = (cb?: (symbol: 'bHODL' | 'uHODL') => unknown) => {
  const loading = useLoading()

  const { userUHODL, userBHODL, actionRefreshHODLPools } = toRefs(
    useHODLStore()
  )
  const unStakeVisible = ref(false)
  const unStakeObj = reactive({
    amount: '0',
    hodlSymbol: '' as 'bHODL' | 'uHODL',
    item: {
      wallet: '',
      title: '',
      max: '0',
    },
  })
  const unStake = (symbol?: 'bHODL' | 'uHODL', amount?: string) => {
    loading.show()
    const hodlAmount =
      amount ?? Big(10).pow(18).times(unStakeObj.amount).toFixed()
    const hodlSymbol = symbol ?? unStakeObj.hodlSymbol
    const poolId =
      hodlSymbol === 'bHODL' ? userBHODL.value.poolId : userUHODL.value.poolId

    return hodlPoolUnstake(poolId, hodlAmount)
      .then((hash) => {
        const { waitTx } = useWaitTx(hash)
        return waitTx()
          .then((bool) => {
            if (bool) {
              useNotify()
              unStakeVisible.value = false
              actionRefreshHODLPools.value(true)
              cb?.(hodlSymbol)
            }
          })
          .catch((err) => {
            if (err.code !== 4001) {
              useNotify({
                type: 'error',
                message: err.message,
              })
            }
            return Promise.reject(err)
          })
      })
      .finally(() => {
        loading.hide()
      })
  }
  const openHODLUnStake = (name: 'bHODL' | 'uHODL') => {
    if (name === 'bHODL') {
      unStakeObj.item.wallet = formatDecimals(userBHODL.value.staked)
      unStakeObj.item.title = 'bHODL'
      unStakeObj.item.max = formatDecimals(userBHODL.value.staked)
      unStakeObj.hodlSymbol = name
    } else if (name === 'uHODL') {
      // formatNumberWithDecimals
      unStakeObj.item.wallet = formatDecimals(userUHODL.value.staked)
      unStakeObj.item.title = 'uHODL'
      unStakeObj.item.max = formatDecimals(userUHODL.value.staked)
      unStakeObj.hodlSymbol = name
    }

    unStakeVisible.value = true
  }
  const formatDecimals = (val: string) => {
    const newVal = val === '' || val === undefined ? 0 : val
    const x = Big(10).pow(18)
    const y = Big(newVal).div(x).toFixed()
    return y
  }
  return {
    unStakeVisible,
    unStakeObj,
    unStake,
    openHODLUnStake,
  }
}
