import { objectEqual } from '~/utils'

export default defineNuxtPlugin(async () => {
  // // 服务端时不可修改config
  if (useIsClient()) {
    const { data: globalConfigJSON } = await useFetch('/config.json')
    const nuxtRuntimeConfig = useRuntimeConfig()

    const globalConfig =
      globalConfigJSON[nuxtRuntimeConfig.public.MODE] ?? globalConfigJSON.locale

    // 或者也可以放到app hook中做
    if (!objectEqual(useAppStore().config, globalConfig)) {
      // 不要新增或者删除键
      Object.assign(nuxtRuntimeConfig.public, globalConfig)
    }
  }
})
