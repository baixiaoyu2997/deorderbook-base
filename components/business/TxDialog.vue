<template>
  <y-dialog
    ref="elRef"
    v-bind="{ ...$attrs, ...props }"
    :show-close="true"
    :close-on-press-escape="false"
    append-to-body
    class="YTxDialog"
    @close="onClose"
  >
    <img
      v-show="txHash || txPending"
      src="~/assets/img/loading@mini.webp"
      alt=""
      class="dialog__bg"
      style="width: 224.53px"
    />
    <img
      v-show="!txPending && !txHash && txSuccess"
      src="~/assets/img/success@mini.webp"
      alt=""
      class="dialog__bg"
      style="width: 273.6px"
    />
    <img
      v-show="!txPending && !txHash && !txSuccess"
      src="~/assets/img/landing_row3@2x.png"
      alt=""
      class="dialog__bg"
      style="width: 273.6px"
    />
    <div class="dialog__info">
      <div v-if="txHash || txPending" class="text--sub">
        Waiting for your DeOrder to be enchanted...
      </div>
      <div v-else-if="!txPending && !txHash && txSuccess">
        <div class="text--main">Success!</div>
        <div class="text--sub">You have successfully DeOrdered:</div>
      </div>
      <div v-else-if="!txPending && !txHash && !txSuccess">
        <div class="text--main">Failed...</div>
        <div class="text--sub">Your Deorder Failed.</div>
      </div>
    </div>

    <div v-show="txHash || txPending" class="card--address">
      <div class="card__title">
        <div>Transaction Address</div>
        <img src="~/assets/img/icon_copy@mini.svg" alt="" @click="goChain()" />
      </div>
      <div ref="txAddressRef" class="card__value">
        {{ txHashCopy }}
      </div>
    </div>
    <div v-show="!txPending && !txHash && txSuccess">
      <div class="card--tx">
        <div class="tx__amount tx__item">
          <div class="item__label">
            <span>Amount</span>
            <span class="label__tag" :class="txTag.color">
              {{ txTag.label }}
            </span>
          </div>
          <div class="item__value">
            {{ getTokenBuyOrSellPair(fromToken as any) }}
            {{ amount }}
            <img src="~/assets/img/icon_help@2x.png" alt="" />
          </div>
        </div>
        <div class="tx__price tx__item">
          <span>Price</span>
          <span>{{ fromToken }} {{ price }}</span>
        </div>
        <div class="tx__strike tx__item">
          <span>Strike</span>
          <span>${{ numberFormat(div18(strike)) }}</span>
        </div>
        <div class="tx__date tx__item">
          <div>Expiry Date</div>
          <div>{{ expiryDate }}</div>
        </div>
        <div class="tx__fee tx__item">
          <span>Fee Used</span>
          <span>{{ fee }}</span>
        </div>
      </div>
      <y-btn bg @click="goPage">Go to Account</y-btn>
    </div>
  </y-dialog>
</template>
<script setup lang="ts">
import { dialogProps } from 'element-plus'
import { provider } from 'deorderbook-sdk/store/provider'
import { div18, numberFormat } from '~/utils'

// 父组件通过ref.value.elRef.xxx调用element-ui组件方法
const elRef = ref(null)

const props = defineProps({
  ...dialogProps,
  // [ 以下为自定义props ]
  fromToken: {
    type: String,
    default: '',
  },
  amount: {
    type: String,
    default: '0',
  },
  price: {
    type: String,
    default: '0',
  },
  strike: {
    type: String,
    default: '0',
  },
  expiryDate: {
    type: String,
    default: '',
  },
  fee: {
    type: String,
    default: '0',
  },
})
const txAddressRef = ref(null)
const txHashCopy = ref('')
const txPending = ref(false)
const txSuccess = ref<boolean | null>(null)
const { txHash } = toRefs(useWalletStore())

const goChain = () => {
  window.open(`https://goerli.etherscan.io/tx/${txHash.value}`)
  // TODO: 添加copy成功提示
}
// [ Success Status]
const { getTokenBuyOrSellPair } = useTokens()
const txTag = computed(() => {
  return {
    label: props.fromToken === 'uHODL' ? 'Buy' : 'Sell',
    color: props.fromToken === 'uHODL' ? 'is-buy' : 'is-sell',
  }
})
const goPage = () => {
  return navigateTo('/account')
}
const { pageInit } = usePageInit()
const onClose = () => {
  pageInit()
}

watch(txHash, () => {
  if (txHash.value !== null) {
    txHashCopy.value = txHash.value
  }
})

watch(txHashCopy, () => {
  if (txHashCopy.value !== '') {
    provider
      .getTransaction(txHashCopy.value)
      .then((tx) => {
        txPending.value = true
        return tx.wait()
      })
      .then((res) => {
        txPending.value = false
        txSuccess.value = res.status === 1
      })
      .then(() => pageInit())
      .catch(() => {
        txPending.value = false
        txSuccess.value = false
        pageInit()
      })
  }
})

// defineEmits(buttonEmits) 不要添加defineEmits，会阻断子组件触发事件
</script>
<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>
<style lang="postcss" scoped>
.YTxDialog.el-dialog {
  & .dialog__bg {
    display: block;
    margin: 0 auto;
  }
  & .dialog__info {
    margin-top: 16px;
    text-align: center;
    & .text--main {
      margin: 24px 0 8px;
      font-size: 16px;
      font-weight: 600;
      line-height: 20px;
    }

    & .text--sub {
      margin: 0 auto;
      font-size: 14px;
      font-weight: 400;
      line-height: 21px;
      opacity: 0.6;
    }
  }

  & .card--address {
    padding: 12px 16px;
    margin-top: 16px;
    background: #212126;
    border: 0.5px solid #777777;
    border-radius: 16px;
    box-shadow: inset 0px 0px 6px #141414;
    & .card__title {
      display: flex;
      align-items: center;
      font-size: 14px;
      font-weight: 600;
      line-height: 18px;
      & img {
        width: 18px;
        height: 18px;
        margin-left: 8px;
        cursor: pointer;
      }
    }
    & .card__value {
      margin-top: 8px;
      font-size: 14px;
      font-weight: 400;
      line-height: 21px;
      opacity: 0.6;
    }
  }

  & .card--tx {
    padding: 16px;
    margin-top: 24px;
    margin-bottom: 24px;
    background: #212126;
    border: 0.5px solid #777777;
    border-radius: 16px;
    box-shadow: inset 0px 0px 6px #141414;
    & .tx__item {
      display: flex;
      justify-content: space-between;
      &:not(:first-child) {
        margin-top: 16px;
      }
      &:first-child {
        font-size: 14px;
        font-weight: 400;
        line-height: 18px;
      }
      &:last-child {
        font-size: 11px;
        font-weight: 400;
        line-height: 18px;
      }
    }
    & .tx__amount {
      & .item__label {
        display: flex;
        align-items: center;
        font-size: 14px;
        font-weight: 400;
        line-height: 18px;
      }
      & .label__tag {
        width: 36px;
        height: 17px;
        margin-left: 8px;
        font-size: 10px;
        font-weight: 600;
        line-height: 15px;

        /* identical to box height */

        text-align: center;

        border-radius: 43px;
        &.is-buy {
          color: #32b845;
          background: linear-gradient(
            0deg,
            #13651f 0%,
            #07310d 60.94%,
            #042108 100%
          );
          border: 0.5px solid #257932;
        }
        &.is-sell {
          color: #f65046;
          background: linear-gradient(
            0deg,
            #c61d10 -6.13%,
            #7f1d17 23.93%,
            #510906 49.55%
          );
          border: 0.5px solid #ba2d24;
        }
      }
      & .item__value {
        display: flex;
        align-items: center;
        & img {
          width: 12px;
          height: 12px;
          margin-left: 4px;
        }
      }
    }
  }
}
</style>
