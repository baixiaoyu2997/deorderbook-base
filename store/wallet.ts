/* eslint-disable max-lines-per-function */
import { defineStore } from 'pinia'
import { ElMessage, MessageHandler } from 'element-plus'
import {
  getTokenBySymbol,
  setOptions,
  getAllFeeRatio,
  setOnAccountChangedCallback,
  setOnChainChangedCallback,
  balanceOf,
} from 'deorderbook-sdk'
import { wallet } from 'deorderbook-sdk/store'
import { parseInt } from 'lodash-es'
import { owner as getOwner } from 'deorderbook-sdk/ethereum/optionFactoryContract'
import {
  feeCollector,
  bulletCollector,
  worker,
} from 'deorderbook-sdk/ethereum/dob_staking_pool'
import { owner as getOTCOwner } from 'deorderbook-sdk/ethereum/market_bullet'
import dayjs from 'dayjs'
import getRpcHost from '~/utils/get-rpc-host'

const balanceEnum = {
  balanceUSDC: 'USDC',
  balanceWBTC: 'WBTC',
  balanceUHODL: 'uHODL',
  balanceBHODL: 'bHODL',
  balanceDOB: 'DOB',
}
const originTokenBalance = () => {
  return {
    balanceUSDC: '0',
    balanceWBTC: '0',
    balanceUHODL: '0',
    balanceBHODL: '0',
    balanceDOB: '0',
  }
}
export const useWalletStore = defineStore('wallet', () => {
  // [State]
  const fee = reactive({
    withdrawFeeRatio: '0',
    exerciseFeeRatio: '0',
    hodlWithdrawFeeRatio: '0',
  })
  const address = ref('')
  const approveHash = ref(null as null | string) // 记录当前交易的hash,交易完成后应该清空
  const txHash = ref(null as null | string) // 记录当前交易的hash,交易完成后应该清空
  const rpcHost = ref(Promise.resolve())
  const isSetOption = ref(false)
  const isConnected = ref(false)
  const tokenBalance = reactive(originTokenBalance())
  // 获取相关币种的信息，不要在钱包外部使用approveSymbols

  const tokensInfo = reactive({
    bHODL: {
      ...getTokenBySymbol('bHODL'),
      approveSymbols: new Set(),
      mapSymbol: 'WBTC',
    },
    uHODL: {
      ...getTokenBySymbol('uHODL'),
      approveSymbols: new Set(),
      mapSymbol: 'USDC',
    },
    WBTC: {
      ...getTokenBySymbol('WBTC'),
      approveSymbols: new Set(),
      mapSymbol: 'bHODL',
    },
    USDC: {
      ...getTokenBySymbol('USDC'),
      approveSymbols: new Set(),
      mapSymbol: 'uHODL',
    },
    DOB: {
      ...getTokenBySymbol('DOB'),
      approveSymbols: new Set(),
    },
    DOBStakingPool: {
      ...getTokenBySymbol('DOBStakingPool'),
      approveSymbols: new Set(),
    },
  })

  // [Init]
  const initStore = () => {
    const rpcHost = getRpcHost()
    // 钱包插件设置参数
    setOptions({
      rpcHost,
    })
    // 获取fee
    getAllFeeRatio().then((res) => {
      Object.assign(fee, res)
    })
    isSetOption.value = true

    setOnAccountChangedCallback(() => {
      if (isConnected.value) {
        window.location.reload()
      }
    })
    setOnChainChangedCallback(() => {
      checkCurrentChain().then()
      if (isConnected.value) {
        window.location.reload()
      }
    })
  }
  // 切换网络
  const {
    public: { chain: $configChain },
  } = useRuntimeConfig() // chain数据来源：https://github.com/ethereum-lists/chains/tree/master/_data/chains
  let notificationNetwork: MessageHandler
  const switchChain = async (type: string) => {
    if (type === 'metamask') {
      const res = await wallet?.switchChain({
        chainId: `0x${($configChain.chainId as number).toString(16)}`,
        chainName: $configChain.chainName,
        rpcUrls: $configChain.rpc,
        blockExplorerUrls: [$configChain.blockExplorerUrls],
        nativeCurrency: $configChain.nativeCurrency as any,
      })
      if (String(res) === 'null') {
        notificationNetwork?.close()
        useNotify()
      }
    } else if (type === 'binanceWallet') {
      wallet?.switchChain({
        chainId: $configChain.chainId.toString(),
      })
    }
  }

  const checkCurrentChain = async () => {
    let type = ''

    if (window?.ethereum?.isMetaMask) {
      type = 'metamask'
    } else if (window.BinanceChain) {
      type = 'binanceWallet'
    } else {
      return
    }
    window.switchChain = switchChain
    let chainId = ''
    if (window?.ethereum?.isMetaMask) {
      chainId = await window.ethereum.request({ method: 'eth_chainId' })
    } else if (window.BinanceChain) {
      chainId = await window.BinanceChain.request({ method: 'eth_chainId' })
    }
    function checkChainId() {
      if (isNaN(Number(chainId))) {
        return Number(chainId) !== $configChain.chainId
      } else {
        return parseInt(chainId) !== $configChain.chainId
      }
    }
    if (checkChainId()) {
      notificationNetwork = ElMessage({
        duration: 0,
        customClass: 'switch-network',
        showClose: true,
        dangerouslyUseHTMLString: true,
        center: true,
        offset: 110,
        message: `<div>Your current network is not supported. Please switch to a supported network.</div><div class='y-button-html' onclick="switchChain('${type}')">Switch Network</div>`,
      })
    }
  }
  watch(isConnected, () => {
    resetWalletBalance()
    if (!isConnected.value) return
    setBalance()
  })
  initStore()
  // [Actions]
  // 钱包中发起交易后，需要更新数据的方法放到这里
  const setBalance = () => {
    // 更新钱包余额
    Object.keys(balanceEnum).forEach((key) => {
      balanceOf(balanceEnum[key], address.value).then((v) => {
        tokenBalance[key] = v.toString() || 0
      })
    })
  }
  // 除了rpcHost和isSetOption都还原
  function resetWallet() {
    Object.assign(fee, {
      withdrawFeeRatio: '0',
      exerciseFeeRatio: '0',
      hodlWithdrawFeeRatio: '0',
    })
    address.value = ''
    isConnected.value = false
    resetWalletBalance()
  }
  function resetWalletBalance() {
    Object.assign(tokenBalance, originTokenBalance())
  }

  const sniperDotEnum = {
    COLLECT: 'collect',
    EXERCISE: 'exercise',
    WALLET: 'wallet',
    SNIPERPOOL: 'sniperPool',
  }
  const sniperDot = ref({
    [sniperDotEnum.COLLECT]: {
      [sniperDotEnum.WALLET]: false,
      [sniperDotEnum.SNIPERPOOL]: false,
    },
    [sniperDotEnum.EXERCISE]: {
      [sniperDotEnum.WALLET]: false,
      [sniperDotEnum.SNIPERPOOL]: false,
    },
  })

  // [ Accounts ]
  const accounts = reactive({
    owner: '',
    feeCollector: '',
    bulletCollector: '',
    otcOwner: '',
    worker: '',
  })
  let accountsUpdatedAt = 0

  async function actionRefreshAccounts() {
    if (accountsUpdatedAt + 15 < dayjs().unix()) {
      await Promise.all([
        getOwner(),
        feeCollector(),
        bulletCollector(),
        getOTCOwner(),
        worker(),
      ]).then((res) => {
        const [
          ownerAddress,
          feeCollectorAddress,
          bulletCollectorAddress,
          otcOwnerAddress,
          workerAddress,
        ] = res
        accounts.owner = ownerAddress
        accounts.feeCollector = feeCollectorAddress
        accounts.bulletCollector = bulletCollectorAddress
        accounts.worker = workerAddress
        accounts.otcOwner = otcOwnerAddress.toString()
        accountsUpdatedAt = dayjs().unix()
      })
    }
  }
  watch(
    isSetOption,
    () => {
      if (isSetOption.value) {
        actionRefreshAccounts()
      }
    },
    {
      immediate: true,
    }
  )

  return {
    accounts,
    fee,
    approveHash,
    txHash,
    address,
    isSetOption,
    isConnected,
    setBalance,
    resetWallet,
    tokenBalance,
    tokensInfo,
    checkCurrentChain,
    ...toRefs(tokenBalance),
    sniperDotEnum,
    sniperDot,
  }
})
