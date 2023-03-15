import { defineStore } from 'pinia'
import { getTransactionList } from 'deorderbook-sdk'

export const useTradesStore = defineStore('trades', () => {
  const { address } = toRefs(useWalletStore())
  const { fetchState, refreshAllState, getCaches } = useActionCache(
    (...args) => {
      const params = args[0] && {
        pageSize: args[0].pageSize || 10,
        where: {
          account:
            args[0].address ||
            args[0].where.account ||
            address.value ||
            undefined,
          ...args[0].where,
        },
      }
      return getTransactionList(params)
    },
    []
  )

  return {
    fetchState,
    refreshAllState,
    getCaches,
  }
})
