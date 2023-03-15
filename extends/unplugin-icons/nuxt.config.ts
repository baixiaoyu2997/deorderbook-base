import Icons from 'unplugin-icons/vite'
export default defineNuxtConfig({
  modules: ['unplugin-icons/nuxt'],
  vite: {
    plugins: [
      Icons({
        // the feature below is experimental ⬇️
        autoInstall: true,
      }),
    ],
  },
})
