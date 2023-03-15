import { defineStore } from 'pinia'
// import { i18n } from '~/plugins/ui'
// 使用composition-api风格编写的store在使用时，解构store时必须要用storeToRefs包裹。
// 目前storeToRefs有bug，使用toRefs替代

export const useHookStore = defineStore('hook', () => {
  const hookState = reactive({})
  const hookPatchedSet = ref(new Set())
  return {
    hookState,
    hookPatchedSet,
  }
})
