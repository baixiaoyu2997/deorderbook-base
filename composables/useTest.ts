export function useTest() {
  const { cache, patchCache } = useHookCache('useTest', () => {
    return { a: 3, b: 4 }
  })
  patchCache((state) => {
    state.a = 7
  })
  const getState = () => {
    console.log(cache.value)
  }

  return {
    cache,
    getState,
    patchCache,
  }
}
