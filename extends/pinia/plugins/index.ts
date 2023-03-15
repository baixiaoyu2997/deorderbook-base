import { PiniaPluginContext } from '@pinia/nuxt/dist/runtime/composables'
function DevToolsPlugin({ store }: PiniaPluginContext) {
  // 我们正在用新的 action 来覆盖这些 action

  if (store.$id === 'rpc') {
    // 获取store所有action
    const actions = Object.keys(store._hmrPayload.actions)
    actions.forEach((action) => {
      const oldAction = store[action]
      // 为action添加devtool信息
      store[action] = (...args: any[]) => {
        return oldAction(...args, useCodeSource({ stackAt: 3 }))
      }
    })
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  if (process.dev) {
    nuxtApp.$pinia.use(DevToolsPlugin)
  }
})
