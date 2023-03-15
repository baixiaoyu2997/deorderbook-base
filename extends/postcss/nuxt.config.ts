const postcssConfig = defineNuxtConfig({
  postcss: {
    plugins: {
      'postcss-preset-env': {
        features: {
          'nesting-rules': true, // 嵌套规则
          'media-query-ranges': true, // 媒体查询范围
        },
      },
      // '@jonny1994/postcss-px-to-viewport': {
      //   viewportWidth: 1440,
      //   propList: [
      //     '*',
      //     '!font-size',
      //     '!line-height',
      //     '!letter-spacing',
      //     '!border',
      //     '!border-top',
      //     '!border-left',
      //     '!border-right',
      //     '!border-bottom',
      //     '!border-radius',
      //   ],
      //   minPixelValue: 1,
      //   include: [/\/pages\/index\//]
      // },
    },
  },
})

export default postcssConfig
