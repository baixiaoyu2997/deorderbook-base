// const isProd = process.env.NODE_ENV === 'production'
// 参考：https://github.com/element-plus/element-plus-nuxt-starter
export default defineNuxtConfig({
  modules: ['@element-plus/nuxt'],
  css: ['element-plus/theme-chalk/dark/css-vars.css', '~/assets/styles/ui.css'],
  app: {
    head: {
      htmlAttrs: {
        class: ['dark'],
      },
    },
  },
})
