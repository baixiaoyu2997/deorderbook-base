<template>
  <div class="TxHistoryHeader">
    <div class="info__title">Account</div>
    <div class="info__card">
      <div class="card__address">
        <div class="address__format">
          <div ref="addressRef" style="position: absolute; z-index: -1">
            {{ address }}
          </div>
          <div>{{ addressFormat }}</div>
          <SVGCopy class="svg__copy" @click="copyAddress"></SVGCopy>
        </div>
        <div class="wallet__type">Connected with {{ walletTypeValue }}</div>
      </div>
      <div v-if="nftURL" class="card__nft">
        <img :src="nftURL" alt="" class="nft__image" />
        <div class="nft__detail">
          <div class="detail__title">{{ nftName }}</div>
          <div class="detail__subtitle">
            <div>{{ nftLevelName }}</div>
            <img src="https://dummyimage.com/20x20.png" alt="" />
          </div>
          <div class="detail__level">Level {{ nftLevel }}</div>
          <div class="detail__progress-bar">
            <div class="progress__current">
              {{ numberFormat(levelCurrentXP) }}/
            </div>
            <div class="progress__max">
              {{ numberFormat(levelXPMax) + ' XP' }}
            </div>
          </div>
        </div>
      </div>
      <div class="card__explorer">
        <div class="disconnect" @click="logout">Disconnect</div>
        <!-- TODO: 跳转地址修改 -->
        <NuxtLink to="/" class="explorer__link">
          <div>Go to Explorer</div>
          <SVGArrow width="16" height="16" class="link__arrow"></SVGArrow>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Big } from 'big.js'
import SVGCopy from '~icons/lucide/copy'
import SVGArrow from '~icons/ic/baseline-arrow-outward'

// 用户钱包地址
const addressRef = ref(null)
const addressFormat = computed(() => {
  const _address = address.value
  return (
    _address.substring(0, 7) + '...' + _address.substring(_address.length - 4)
  )
})
const { copy } = useCopyText()
const copyAddress = () => {
  copy(addressRef.value)
}
// 连接钱包类型
const { user } = toRefs(useAppStore())
const walletTypeValue = computed(() => {
  const walletTypeEnum = {
    metamask: 'MetaMask',
    walletconnect: 'WalletConnect',
  } as const
  return walletTypeEnum[user.value.walletType as 'metamask' | 'walletconnect']
})
// [NFT]
const { formatNFTs } = useNFT()
const firstNFTValue = computed(() => {
  return formatNFTs.value[0]
})
const nftURL = computed(() => {
  return (
    firstNFTValue.value?.metadata?.keyvalues?.image &&
    firstNFTValue.value?.metadata?.keyvalues.image +
      '?img-format=webp&img-width=120&img-height=120'
  )
})
const nftLevel = computed(() => {
  return firstNFTValue.value?.level || '0'
})
const nftName = computed(() => firstNFTValue.value?.metadata?.keyvalues?.name)
const nftLevelName = ref('Chief Marshal') // TODO: data mock
const levelXPMax = ref('10032') // TODO: data mock
const levelCurrentXP = computed(() => firstNFTValue.value?.xp || '0')
const progressWidth = ref('245.93')
const levelProgress = computed(() => {
  return Big(levelCurrentXP.value)
    .div(levelXPMax.value)
    .times(progressWidth.value)
    .toFixed()
})
// xp为0时，border应为none
const levelProgressBorder = computed(() => {
  return levelCurrentXP.value === '0' ? 'none' : `1px solid #2463c5`
})

// logout
const { address, disconnectWallet } = useWallet()
const logout = () => {
  emits('logout')
  disconnectWallet()
}
const emits = defineEmits(['logout'])
</script>
<style lang="postcss" scoped>
.TxHistoryHeader {
  & .info__title {
    margin-top: 11px;
    font-size: 24px;
    font-weight: 700;
    line-height: 32px;
    color: #fff;
  }
  & .info__card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 32px;
    margin-top: 24px;
    background: #26262b;
    border: 1px solid #4d4d4d;
    border-radius: 16px;
    & .address__format {
      position: relative;
      display: flex;
      align-items: center;
      font-size: 20px;
      font-weight: 700;
      line-height: 24px;
      color: #ffffff;
    }
    & .svg__copy {
      margin-left: 8px;
      color: rgba(255, 255, 255, 0.4);
      cursor: pointer;
    }
    & .wallet__type {
      margin-top: 16px;
      font-size: 14px;
      font-weight: 400;
      line-height: 18px;
      color: #ffffff;
      opacity: 0.6;
    }
    & .card__nft {
      flex: 1;
      margin-left: 80px;
      & .nft__image {
        display: inline-block;
        width: 119.5px;
        height: 119.5px;
        margin-right: 24px;
        border: 1.19501px solid #4c4c4c;
        border-radius: 19.1202px;
      }
      & .nft__detail {
        display: inline-block;
        vertical-align: top;
        & .detail__title {
          font-size: 20px;
          font-weight: 700;
          line-height: 24px;
          color: #ffffff;
        }
        & .detail__subtitle {
          display: flex;
          align-items: center;
          margin-top: 8px;
          font-size: 14px;
          font-weight: 400;
          line-height: 18px;
          color: #ffffff;

          & img {
            width: auto;
            height: 19.5px;
            margin-left: 8px;
          }
        }
        & .detail__level {
          margin-top: 16.5px;
          font-size: 16px;
          font-weight: 600;
          line-height: 20px;
          color: #ffffff;
        }
        & .detail__progress-bar {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: v-bind('progressWidth+"px"');
          height: 20px;
          margin-top: 4px;
          font-size: 11px;
          font-weight: 400;
          line-height: 1;
          background: #313131;
          border-radius: 36.7147px;
          &::before {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            width: v-bind('levelProgress+"px"');
            height: 100%;
            content: '';
            background: linear-gradient(
              180deg,
              #002978 -11.55%,
              #00268d -0.28%,
              #0072ac 5.35%,
              #01d1ec 12.28%,
              #00dde2 15.43%,
              #07e9f5 24.85%,
              #0068c7 48.68%,
              #274be2 59.08%,
              #002980 82.6%
            );
            border: v-bind(levelProgressBorder);
            border-radius: 36.7147px;
          }
          & .progress__current {
            z-index: 1;
          }
          & .progress__max {
            z-index: 1;
          }
        }
      }
    }
  }
  & .card__explorer {
    font-size: 16px;
    font-weight: 400;
    line-height: 20px;
    text-align: right;
    & .disconnect {
      color: #de4238;
      cursor: pointer;
    }
    & .explorer__link {
      display: flex;
      align-items: center;
      margin-top: 11.03px;
      text-decoration: underline;
      opacity: 0.6;
      & .link__arrow {
        margin-left: 4px;
      }
    }
  }
}
</style>
