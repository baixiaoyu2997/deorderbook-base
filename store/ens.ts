import { defineStore } from 'pinia'

export const useENSStore = defineStore('ens', () => {
  const { fetchState, refreshAllState } = useActionCache(
    (...args) => {
      return defaultProvider.lookupAddress(args[0])
    },
    '',
    {
      interval: Number.MAX_SAFE_INTEGER,
    }
  )
  const {
    fetchState: fetchResolveNameState,
    refreshAllState: refreshAllResolveNameState,
  } = useActionCache(
    (...args) => {
      return defaultProvider.resolveName(args[0])
    },
    '',
    {
      interval: Number.MAX_SAFE_INTEGER,
    }
  )
  return {
    fetchState,
    refreshAllState,
    fetchResolveNameState,
    refreshAllResolveNameState,
  }
})
