const isProd = process.env.NODE_ENV === 'production'

const optimizeConfig = defineNuxtConfig({
  app: {
    head: {
      meta: [
        // 禁用页面的缓存
        { 'http-equiv': 'Expires', content: '0' },
        { 'http-equiv': 'Pragma', content: 'no-cache' },
        { 'http-equiv': 'Cache-control', content: 'no-cache' },
        { 'http-equiv': 'Cache', content: 'no-cache' },
      ],
    },
  },
  modules: [
    '@nuxtjs/robots',
    [
      'nuxt-purgecss', // Remove unneeded CSS
      {
        // https://purgecss.com/safelisting.html#patterns
        safelist: {
          greedy: [/^el-/],
          standard: ['body', 'dark', 'light', 'html'],
        },
      },
    ],
  ],
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            element: ['element-plus'],
            // walletconnect: [
            //   '@walletconnect/web3-provider/dist/umd/index.min.js',
            // ],
          },
          // 手动拆包
          // manualChunks(id) {
          //   const excludeList = ['nuxt', '@nuxt']
          //   if (id.includes('node_modules')) {
          //     const searchTerm = 'node_modules/'
          //     const pkgPath = id
          //       .toString()
          //       .substring(id.lastIndexOf(searchTerm) + searchTerm.length)
          //     const pkgName = pkgPath.split('/')[0].toString()

          //     if (pkgName !== 'element-plus' && pkgName !== 'lodash-es') {
          //       console.log(pkgName)
          //     }

          //     if (excludeList.every((x) => x !== pkgName)) {
          //       return pkgName
          //     }
          //   }
          // },
        },
      },
    },
  },
  nitro: {
    compressPublicAssets: {
      gzip: true,
    },
    routeRules: {
      '*': {
        headers: {
          'cache-control': 'public, max-age=2592000, no-cache=html',
        },
      },
    },
    // routeRules: [
    //   {
    //     // 匹配所有路由
    //     name: 'all-routes',
    //     path: '*',
    //     // 设置 html 文件不缓存，其他文件缓存时间为一个月
    //     headers: {
    //       'cache-control': 'public, max-age=2592000, no-cache=html',
    //     },
    //   },
    // ],
  },
})

export default optimizeConfig
