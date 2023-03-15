<template>
  <div class="y-token-form card--small">
    <div class="row__form">
      <y-select
        v-model="tokenSelect"
        width="133"
        height="36"
        border-radius="60"
        :icon="getTokenIcon(tokenSelect)"
        :readonly="selectReadonly"
        @change="onSelectChange"
      >
        <el-option
          v-for="token in selectOptions"
          :key="token"
          :label="token"
          :value="token"
        >
          <img :src="getTokenIcon(token)" />
          <span>{{ token }}</span>
        </el-option>
      </y-select>
      <el-input
        :model-value="tokenAmount"
        type="number"
        :readonly="inputReadonly"
        class="common-input--no-border"
        @input="onAmountInput"
      ></el-input>
    </div>
    <div class="row__balance">
      <div class="info--left">
        <div class="info__balance">
          {{ balanceLabel }}:{{
            ' ' +
            useTokenNumberFormat(tokenBalance, { token: tokenSelect }) +
            ' ' +
            tokenSelect
          }}
        </div>
        <div v-if="showMax" class="info__max" @click="onClickMax">MAX</div>
      </div>
      <div v-if="showUsd" class="info__usd">
        {{ useUSDFormat(tokenUSD, { showApprox: true }) }}
      </div>
    </div>
    <div v-if="fee && fee !== '0'" class="row__fee">
      <div class="fee__info">Receive (incl. {{ fee }}% fee)</div>
      <div class="fee__receive">
        {{ useTokenNumberFormat(receiveTokenAmount, { token: tokenSelect }) }}
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { PropType } from 'vue'
import { Big } from 'big.js'
import { div18 } from '~/utils'

// [ Init ]
const { getTokenIcon, getTokenBalance, getTokenPrice } = useTokens()
type TokenIcon = 'USDC' | 'WBTC' | 'uHODL' | 'bHODL'

const props = defineProps({
  /**
   * 选中的token
   */
  select: {
    type: String as PropType<TokenIcon>,
    default: '',
  },
  /**
   * select组件只读，不可编辑
   */
  selectReadonly: {
    type: Boolean,
    default: false,
  },
  /**
   * select可用的option
   */
  selectOptions: {
    type: Array as PropType<TokenIcon[]>,
    default: () => [
      'USDC',
      'WBTC',
      'uHODL',
      'bHODL',
      'uSNIPER',
      'bSNIPER',
      'uBULLET',
      'bBULLET',
    ],
  },
  /**
   * token数量
   */
  modelValue: {
    type: String,
    default: '',
  },
  /**
   * 手动传入余额
   */
  balance: {
    type: String as PropType<`${number}`>,
    default: null,
  },
  /**
   * 余额label
   */
  balanceLabel: {
    type: String,
    default: 'Balance',
  },
  /**
   * input是否只读
   */
  inputReadonly: {
    type: Boolean,
    default: false,
  },
  /**
   * 是否显示max按钮
   */
  showMax: {
    type: Boolean,
    default: true,
  },
  /**
   * 收取的fee,如果存在该属性，则显示费用相关内容
   */
  fee: {
    type: String,
    default: undefined,
  },
  /** 是否显示token对应的美元价值 */
  showUsd: {
    type: Boolean,
    default: true,
  },
})
const { selectReadonly, selectOptions, fee } = toRefs(props)

const emits = defineEmits([
  'update:select',
  'selectChange',
  'update:modelValue',
  'max',
])

// [ Select ]
const tokenSelect = ref(props.select)
const onSelectChange = (v) => {
  emits('selectChange', v)
}

const tokenUSDRate = computed(() => {
  return getTokenPrice(tokenSelect.value).value
})

const tokenUSD = computed(() => {
  return Big(tokenAmount.value || '0')
    .times(tokenUSDRate.value || '0')
    .toFixed()
})

// [ Amount ]
const tokenAmount = computed({
  get() {
    return props.modelValue
  },
  set(v: `${number}`) {
    onAmountInput(v, 'input')
  },
})
const formatNumberDebounceFn = useNumberLimitDebounceFn({ wait: 500 })
const onAmountInput = (v: `${number}`, from: 'input' | 'max' = 'input') => {
  emits('update:modelValue', v)

  formatNumberDebounceFn(v, (formatNumber) => {
    if (formatNumber !== v) {
      emits('update:modelValue', formatNumber)
    }
  })
}

const onClickMax = () => {
  onAmountInput(tokenBalance.value, 'max')
  emits('max', tokenBalance.value)
}

// [ Balance ]
const tokenBalance = computed(() => {
  return props.balance ?? div18(getTokenBalance(tokenSelect.value).value)
})

// [ fee ]
const receiveTokenAmount = computed(() => {
  return Big(tokenAmount.value || 0)
    .times(Big(1).minus(Big(fee?.value || 0).div(100) || 0))
    .toFixed()
})

// [ Bullet ]

// [ Expose ]
defineExpose({
  tokenAmount,
  tokenBalance,
})
</script>

<style lang="postcss" scoped>
.y-token-form {
  &.card--small {
    padding: 12px 16px;
    background: #212126;
    border: 0.5px solid #777777;
    border-radius: 16px;
    box-shadow: inset 0px 0px 6px #141414;
  }
  & .common-input--no-border.el-input {
    font-size: 20px; /* input字体大小 */

    & :deep(.el-input__wrapper) {
      padding: 0;
      background-color: transparent; /* input 背景色 */
      border: none; /* input 边框颜色 */
      box-shadow: none; /* input 边框shadow */
    }
    & :deep(.el-input__inner) {
      text-align: right; /* input value对齐方式 */
    }
    & :deep(input) {
      font-weight: 700; /* 修改字重 */
    }
  }
  & .row__form {
    display: flex;
    align-items: center;
  }
  & .row__balance {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
    font-size: 11px;
    font-weight: 400;
    line-height: 18px;
    color: rgba(255, 255, 255, 0.6);
    & .info--left {
      display: flex;
      align-items: center;
    }
    & .info__max {
      margin-left: 8px;
      font-size: 12px;
      font-weight: 600;
      color: #ffc550;
      cursor: pointer;
    }
  }
  & .row__fee {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 9px 0 2px;
    margin-top: 10px;
    font-size: 12px;
    font-weight: 600;
    line-height: 18px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    & .fee__receive {
      font-size: 14px;
    }
  }
}
</style>
