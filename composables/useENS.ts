import { Ref } from 'vue'

/**
 * @description user ENS
 */
export function useENS() {
  const { fetchState, fetchResolveNameState } = toRefs(useENSStore())

  const lookupAddress = (address: Ref<string> | string) => {
    return computed(() => fetchState.value(unref(address)).value)
  }

  const resolveName = (name: Ref<string> | string) => {
    return computed(() => fetchResolveNameState.value(unref(name)).value)
  }

  return {
    lookupAddress,
    resolveName,
  }
}
