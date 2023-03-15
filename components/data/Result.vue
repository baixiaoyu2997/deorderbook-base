<template>
  <div class="y-result">
    <img src="~/assets/img/loading@mini.gif" alt="" class="result__bg" />
    <div class="result__info">
      <div v-if="!txHash" class="text--main">Success!</div>
      <div class="text--sub">
        {{
          txHash
            ? `Waiting for your ${fromToken} to be ${action}...`
            : `You have successfully ${action} ${useTokenNumberFormat(
                div18(18),
                { token: getTokenPair(fromToken) }
              )} ${getTokenPair(fromToken)}`
        }}
      </div>
    </div>
    <div v-show="!txHash">
      <div class="card--tx">
        <div class="tx__amount tx__item">
          <div class="item__label">
            <span>Amount</span>
          </div>
        </div>
        <div class="tx__fee tx__item">
          <span>Fee Used</span>
          <span>{{ props.fee }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { PropType } from 'vue'
import { div18, numberFormat } from '~/utils'

const props = defineProps({
  // [ 以下为自定义props ]
  /**
   * 定义用户使用的是什么操作，并显示到等待阶段
   */
  action: {
    type: String,
    default: '',
  },
  fromToken: {
    type: String as PropType<'uHODL' | 'bHODL' | 'WBTC' | 'USDC'>,
    default: '',
  },
  amount: {
    type: String,
    default: '0',
  },
  fee: {
    type: String,
    default: '0',
  },
})

const { txHash } = toRefs(useWalletStore())
// [ Success Status]
const { getTokenPair } = useTokens()

// const { pageInit } = usePageInit()
// const onClose = () => {
//   pageInit()
// }
// defineEmits(buttonEmits) 不要添加defineEmits，会阻断子组件触发事件
</script>
<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>
<style lang="postcss" scoped>
.y-result {
  & .result__bg {
    display: block;
    width: 220px;
    margin: 0 auto;
  }
  & .result__info {
    margin-top: 24px;
    text-align: center;
    & .text--main {
      margin: 8px 0;
    }

    & .text--sub {
      margin: 0 auto;
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
