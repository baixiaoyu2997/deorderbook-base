import { setupSubgraph } from 'deorderbook-sdk/store/subgraph'
import { defineStore } from 'pinia'

const originStore = () => {
  return {
    id: '',
    UA: '',
    loadingInstance: null as any,
    isMobile: false,
    user: {
      isLogged: false,
      walletType: '',
    },
  }
}

export const useAppStore = defineStore('app', () => {
  const store = reactive(originStore())

  function setIsMobile(value: boolean) {
    store.isMobile = value
  }

  // function setUA(payload: any) {
  //   const { UA } = payload
  //   if (UA) {
  //     store.UA = UA
  //     this.commit('setStore', { currency: UA.currency })
  //     setTimeout(() => {
  //       this.commit('setTheme', { theme: UA.theme })
  //     })
  //   }
  // }

  function setIsLogged(payload: any, walletType: string) {
    store.user.isLogged = payload
    store.user.walletType = walletType
    if ('localStorage' in window) {
      if (payload) {
        localStorage.setItem('isLogged', payload)
        localStorage.setItem('walletType', walletType)
      } else {
        localStorage.removeItem('isLogged')
        localStorage.removeItem('walletType')
        localStorage.removeItem('walletconnect')
      }
    }
  }
  function initAppStore() {
    // 切换不同的subgraph endpoint
    setupSubgraph({ version: 'next' })
  }
  initAppStore()
  return {
    // setUA,
    setIsMobile,
    setIsLogged,
    ...toRefs(store),
  }
})
