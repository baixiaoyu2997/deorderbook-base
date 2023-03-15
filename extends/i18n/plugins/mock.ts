import en from '../../../locales/en.json'
export default defineNuxtPlugin(() => {
  return {
    provide: {
      t: (v) => {
        const key1 = v.split('.')[0]
        const key2 = v.split('.')[1]
        return en[key1][key2]
      },
    },
  }
})
