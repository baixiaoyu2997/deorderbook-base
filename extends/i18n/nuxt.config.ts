import url from 'url'

export default defineNuxtConfig({
  alias: {
    '#i18n': url.fileURLToPath(new URL('./i18n-mock.js', import.meta.url)),
  },
  // modules: ['@nuxtjs/i18n'],

  // i18n: {
  //   langDir: 'locales',
  //   locales: [
  //     {
  //       code: 'en',
  //       iso: 'en-US',
  //       file: 'en.json',
  //       name: 'English',
  //     },
  //     {
  //       code: 'ko',
  //       iso: 'ko-KO',
  //       file: 'ko.json',
  //       name: 'Koran',
  //     },
  //   ],
  //   defaultLocale: 'en',
  //   vueI18n: {
  //     legacy: false,
  //     locale: 'en',
  //     fallbackLocale: 'en',
  //   },
  // },
})
