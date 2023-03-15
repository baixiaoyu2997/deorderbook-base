import { defineStore } from 'pinia'
import { Big } from 'big.js'
import dayjs from 'dayjs'
import useTokens from '~/composables/useTokens'
import { onWalletReady } from '~/composables/onWalletReady'

export interface FormattedToken {
  name: string
  symbol: string
  address: string
  // eg: 18
  decimals: string
  // eg: 1e18
  denominator: string
  priceUSD: string
}

export interface PriceCacheItem {
  priceUSD: string
  updatedAt: number
}

export const useTokensStore = defineStore('tokens', () => {
  const loading = ref(false)
  const formattedTokens = ref<FormattedToken[]>([])
  // TODO: tmp hard code
  const tokenDOB = ref<FormattedToken>({
    priceUSD: '0',
    decimals: '18',
    denominator: (1e18).toFixed(),
  } as FormattedToken)
  const tokenUSDC = ref<FormattedToken>({
    priceUSD: '1',
    decimals: '18',
    denominator: (1e18).toFixed(),
  } as FormattedToken)
  const tokenWBTC = ref<FormattedToken>({
    priceUSD: '0',
    decimals: '18',
    denominator: (1e18).toFixed(),
  } as FormattedToken)
  const tokenUHODL = ref<FormattedToken>({
    priceUSD: '1',
    decimals: '18',
    denominator: (1e18).toFixed(),
  } as FormattedToken)
  const tokenBHODL = ref<FormattedToken>({
    priceUSD: '0',
    decimals: '18',
    denominator: (1e18).toFixed(),
  } as FormattedToken)
  const tokenUBullet = ref<FormattedToken>({
    priceUSD: '0',
    decimals: '18',
    denominator: (1e18).toFixed(),
  } as FormattedToken)
  const tokenBBullet = ref<FormattedToken>({
    priceUSD: '0',
    decimals: '18',
    denominator: (1e18).toFixed(),
  } as FormattedToken)
  const tokenUSniper = ref<FormattedToken>({
    priceUSD: '0',
    decimals: '18',
    denominator: (1e18).toFixed(),
  } as FormattedToken)
  const tokenBSniper = ref<FormattedToken>({
    priceUSD: '0',
    decimals: '18',
    denominator: (1e18).toFixed(),
  } as FormattedToken)

  let updatedAt = 0
  const updateDuration = 15
  const { getTokenUSD } = useTokens()

  onWalletReady(
    () => {
      actionRefreshTokensPrice().then()
    },
    {
      status: 'setup',
    }
  )

  async function actionRefreshTokensPrice(force = false) {
    if (
      force ||
      (loading.value === false && dayjs().unix() - updatedAt >= updateDuration)
    ) {
      loading.value = true
      updatedAt = dayjs().unix()
      tokenUSDC.value.priceUSD = '1'
      tokenUHODL.value.priceUSD = '1'
      const getDOBPrice = getTokenUSD('DOB').then((resp: string) => {
        tokenDOB.value.priceUSD = resp
      })
      const getWBTCPrice = getTokenUSD('WBTC').then((resp: string) => {
        tokenWBTC.value.priceUSD = resp
        tokenBHODL.value.priceUSD = resp
      })
      await Promise.all([getDOBPrice, getWBTCPrice]).finally(() => {
        loading.value = false
      })
    }
  }

  /**
   * Map[key]price, eg: ["0x12412412..."]"12.324"
   * key: sniper address
   */
  const sniperPrice = ref(new Map<string, PriceCacheItem>())
  const bulletPrice = ref(new Map<string, PriceCacheItem>())

  function getSniperPrice(
    type: 'uSNIPER' | 'bSNIPER',
    strikePrice: string,
    address: string
  ) {
    const target = sniperPrice.value.get(address)
    if (
      target === undefined ||
      (target && target.updatedAt + updateDuration <= dayjs().unix())
    ) {
      if (type === 'uSNIPER') {
        if (Big(strikePrice).div(1e18).gt(tokenWBTC.value.priceUSD)) {
          const price = (
            Number(tokenWBTC.value.priceUSD) /
            Big(strikePrice).div(1e18).toNumber()
          ).toFixed()
          sniperPrice.value.set(address, {
            priceUSD: price,
            updatedAt: dayjs().unix(),
          })
        } else {
          sniperPrice.value.set(address, {
            priceUSD: '1',
            updatedAt: dayjs().unix(),
          })
        }
      } else if (type === 'bSNIPER') {
        if (Big(strikePrice).div(1e18).gt(tokenWBTC.value.priceUSD)) {
          sniperPrice.value.set(address, {
            priceUSD: tokenWBTC.value.priceUSD,
            updatedAt: dayjs().unix(),
          })
        } else {
          sniperPrice.value.set(address, {
            priceUSD: Big(strikePrice).div(1e18).toFixed(),
            updatedAt: dayjs().unix(),
          })
        }
      }
    }
    return computed(() => {
      return sniperPrice.value.get(address)
    })
  }

  async function getBulletPrice(
    type: 'uBULLET' | 'bBULLET',
    strikePrice: string,
    exerciseTimestamp: string,
    address: string
  ) {
    const target = bulletPrice.value.get(address)
    if (
      target === undefined ||
      (target && target.updatedAt + updateDuration <= dayjs().unix())
    ) {
      if (type === 'uBULLET') {
        const price = await $fetch(
          `https://35.82.30.121/api/core/price/?bullet_name=uBullet_${exerciseTimestamp}_${strikePrice}`
        ).then((res: any) => res.data.price || '0')
        bulletPrice.value.set(address, {
          priceUSD: price,
          updatedAt: dayjs().unix(),
        })
      } else if (type === 'bBULLET') {
        const price = await $fetch(
          `https://35.82.30.121/api/core/price/?bullet_name=bBullet_${exerciseTimestamp}_${strikePrice}`
        ).then((res: any) => res.data.price || '0')
        bulletPrice.value.set(address, {
          priceUSD: price,
          updatedAt: dayjs().unix(),
        })
      }
    }
    return computed(() => {
      return bulletPrice.value.get(address)
    })
  }

  return {
    loading,
    tokenDOB,
    tokenWBTC,
    tokenUSDC,
    tokenUHODL,
    tokenBHODL,
    tokenUSniper,
    tokenBSniper,
    tokenUBullet,
    tokenBBullet,
    getBulletPrice,
    getSniperPrice,
    formattedTokens,
    actionRefreshTokensPrice,
  }
})
