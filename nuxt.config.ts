import globalConfigJSON from './public/config.json'
const globalConfig =
  globalConfigJSON[process.env.MODE] ?? globalConfigJSON.locale

const isProd = process.env.NODE_ENV === 'production'
// TODO: 暂时忽略以下目录
const ignorePages = []
const config = defineNuxtConfig({
  // 继承，不支持别名路径
  extends: [
    './extends/client-dynamic-config',
    './extends/postcss',
    './extends/element-plus',
    './extends/deorderbook-sdk',
    './extends/i18n',
    './extends/optimize',
    './extends/unplugin-icons',
    './extends/pinia',
  ],
  imports: {
    dirs: ['./composables', './store'],
  },
  app: {
    head: {
      title: 'DeOrderBook',
      meta: [
        { charset: 'utf-8' },
        {
          name: 'viewport',
          content:
            'width=device-width, initial-scale=1.0, minimum-scale=1.0, viewport-fit=cover',
        },
        { hid: 'description', name: 'description', content: '' },
        { name: 'format-detection', content: 'telephone=no, email=no' },
        { name: 'referrer', content: 'no-referrer' }, // 图片引用403
      ],
      link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }],
      htmlAttrs: {
        lang: 'en',
        class: ['root'],
      },
    },
  },
  css: [
    '~/assets/styles/theme.css',
    '~/assets/styles/global.css',
    '~/assets/styles/layout.css',
  ],
  modules: ['@pinia/nuxt', '@vueuse/nuxt'],
  runtimeConfig: {
    public: {
      MODE: process.env.MODE,
      ...globalConfig,
    },
  },
  components: {
    dirs: [
      { path: '~/components/basic/', prefix: 'y' },
      { path: '~/components/others/', prefix: 'y' },
      { path: '~/components/form/', prefix: 'y' },
      { path: '~/components/navigation/', prefix: 'y' },
      { path: '~/components/data/', prefix: 'y' },
      { path: '~/components/business/', prefix: 'y' },
      { path: '~/components/feedback/', prefix: 'y' },
    ],
  },
  vite: {
    server: {
      hmr: {
        // fix when use global proxy always refresh issue，https://github.com/vitejs/vite/issues/2968
        host: 'localhost',
      },
    },
    // build: {
    //   minify: false,
    // },
  },
  build: {
    analyze: true,
  },
  ignore: isProd
    ? ['pages/**/items/*.vue', 'pages/test.vue', ...ignorePages]
    : ignorePages,
  hooks: {
    'prepare:types'({ tsConfig }) {
      // 解决ts自动完成导入时，alias为~~的问题，https://github.com/nuxt/framework/issues/7277#issuecomment-1252390503
      const aliasesToRemoveFromAutocomplete = ['~~', '~~/*', '@@', '@@/*']
      for (const alias of aliasesToRemoveFromAutocomplete) {
        if (tsConfig.compilerOptions?.paths[alias]) {
          delete tsConfig.compilerOptions.paths[alias]
        }
      }
    },
  },
})

export default config
