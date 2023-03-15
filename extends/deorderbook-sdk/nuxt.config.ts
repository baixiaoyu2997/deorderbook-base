import { resolve } from 'path'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
const isDEV = process.env.NODE_ENV !== 'production'

export default defineNuxtConfig({
  alias: {
    'deorderbook-sdk/*': resolve(
      process.cwd(),
      './node_modules/deorderbook-sdk/dist/src/*'
    ),
  },
  hooks: {
    // for web3 build
    'vite:extendConfig'(clientConfig, { isClient }) {
      if (
        isClient &&
        process.env.NODE_ENV === 'production' &&
        clientConfig.resolve?.alias !== undefined
      ) {
        ;(clientConfig.resolve.alias as any)['@walletconnect/web3-provider'] =
          resolve(
            process.cwd(),
            './node_modules/@walletconnect/web3-provider/dist/umd/index.min.js'
          )
      }
    },
  },
  vite: {
    optimizeDeps: {
      // 对sdk中的依赖进行预编译
      include: [
        'dayjs',
        'ethers',
        '@uniswap/sdk-core',
        '@uniswap/sdk',
        '@uniswap/sdk-core',
        '@uniswap/v3-sdk',
        '@ethersproject/abi',
        '@ethersproject/abstract-provider',
        '@ethersproject/abstract-signer',
        '@ethersproject/address',
        '@ethersproject/base64',
        '@ethersproject/basex',
        '@ethersproject/bignumber',
        '@ethersproject/bytes',
        '@ethersproject/constants',
        '@ethersproject/contracts',
        '@ethersproject/hash',
        '@ethersproject/hdnode',
        '@ethersproject/json-wallets',
        '@ethersproject/keccak256',
        '@ethersproject/logger',
        '@ethersproject/networks',
        '@ethersproject/pbkdf2',
        '@ethersproject/properties',
        '@ethersproject/providers',
        '@ethersproject/random',
        '@ethersproject/rlp',
        '@ethersproject/sha2',
        '@ethersproject/signing-key',
        '@ethersproject/solidity',
        '@ethersproject/strings',
        '@ethersproject/transactions',
        '@ethersproject/units',
        '@ethersproject/wallet',
        '@ethersproject/web',
        '@ethersproject/wordlists',
      ],
      // 禁用vite对sdk的缓存
      exclude: ['deorderbook-sdk'],
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: 'globalThis',
        },
        // Enable esbuild polyfill plugins
        plugins: [
          NodeGlobalsPolyfillPlugin({
            process: true,
            buffer: true,
          }),
          NodeModulesPolyfillPlugin(),
        ],
      },
    },
    server: {
      fs: {
        // 防止link本地package调试时报错
        allow: isDEV ? ['/'] : undefined,
      },
    },
  },
})
