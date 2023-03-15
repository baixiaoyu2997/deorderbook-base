import * as globalConfigJSON from '../../public/config.json'
const globalConfig =
  globalConfigJSON[process.env.MODE] ?? globalConfigJSON.locale
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      MODE: process.env.MODE,
      ...globalConfig,
    },
  },
})
