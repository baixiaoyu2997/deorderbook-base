<template>
  <div class="y-create-hodl">
    <div>
      <y-token-form
        ref="tokenFormRef"
        v-model:select="formData.selectValue"
        v-model="formData.amount"
        select-readonly
        @select-change="onSelectChange"
      ></y-token-form>
    </div>
    <div class="row__transform">
      <el-icon
        :size="20"
        color="#6D6D77"
        :style="isToggle ? 'cursor: pointer' : ''"
        @click="toggleAction"
      >
        <Sort />
      </el-icon>
    </div>
    <div>
      <y-token-form
        :model-value="formData.amount"
        :select="toToken"
        select-readonly
        input-readonly
        :show-max="false"
        :fee="hodlWithdrawFee"
      ></y-token-form>
      <y-btn
        class="form__button"
        bg
        height="50"
        :disabled="!!buttonDisabled"
        @click="onSubmit"
      >
        {{ formBtnText }}
      </y-btn>
      <div v-if="actionFees !== '0'" class="from__fee">
        <span>Fees</span>
        <span>
          {{
            useTokenNumberFormat(actionFees, { token: formData.selectValue }) +
            ' '
          }}{{ formData.selectValue }}({{
            useUSDFormat(actionFeesUSD, { showApprox: true })
          }})
        </span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
/**
 * @property  { string } selected 属性提供默认选中token功能
 * @property  { array } supports 支持哪些类型，默认['Mint'],支持'Mint'和'Redeem'
 * @property  { bool } selectDisabled 是否禁用切换token
 * @property  { fn } onSuccess 成功事件
 * @property  { fn } onError 失败事件
 * @returns  { _useRefsInit, selfInit } _useRefsInit标志表示使用了_useRefsInit功能，selfInit可以通过ref init组件
 */

import { Big } from 'big.js'
import type { PropType } from 'vue'
import { Sort } from '@element-plus/icons-vue'
import {
  deposit as apiDeposit,
  withdraw as apiWithdraw,
} from 'deorderbook-sdk/ethereum/hodl'
import IconEth from 'assets/img/icon_wbtc@2x.png'
import IconUSDC from 'assets/img/icon_usdc@2x.png'
import IconBHODL from 'assets/img/icon_bhodl@2x.png'
import IconUHODL from 'assets/img/icon_coin_uHODL@2x.png'
import { YMessage } from '~/utils'

// [Init]
const { getTokenPrice } = useTokens()
const iconEnum = {
  WBTC: IconEth,
  USDC: IconUSDC,
  bHODL: IconBHODL,
  uHODL: IconUHODL,
}
type SelectedTokens = keyof typeof iconEnum
const props = defineProps({
  selectDisabled: {
    type: Boolean,
    default: false,
  },
  selected: {
    type: String as PropType<SelectedTokens>,
    default: '',
  },
  supports: {
    type: Array as unknown as () => NonEmptyArray<'Mint' | 'Redeem'>,
    default: () => ['Mint'],
  },
})
const emits = defineEmits(['on-success', 'on-error'])
defineExpose({
  _useRefsInit: true as const,
  selfInit: (object) => selfInit?.(object),
})

const { selfInit } = useRefsInit<{ resetAll: boolean }>(
  (options = { resetAll: true }) => {
    const { resetAll } = options
    formData.amount = ''
    if (resetAll) {
      // 重置选中项和toggle状态
      formData.selectValue =
        props.selected ||
        (props.supports.length === 1 && props.supports.includes('Redeem')
          ? 'bHODL'
          : 'WBTC')
      formData.actionType = ''
    }
  }
)

const loading = useLoading()
const isToggle =
  props.supports.includes('Mint') && props.supports.includes('Redeem')

const {
  balanceWBTC,
  balanceUSDC,
  balanceBHODL,
  balanceUHODL,
  txWithApprove,
  tokensInfo,
  fee,
} = useWallet()

// [Form]
const formData = reactive({
  selectValue: '' as SelectedTokens,
  actionType: '',
  amount: '',
})
selfInit?.()

const hodlWithdrawFee = computed(() => {
  return String(
    formData.actionType === 'Mint'
      ? '0'
      : String(Number(fee.value.hodlWithdrawFeeRatio))
  )
})
watchEffect(() => {
  formData.actionType = formData.selectValue.endsWith('HODL')
    ? 'Redeem'
    : 'Mint'
})

const onSelectChange = () => {
  formData.amount = ''
}

// 切换Mint/Redeem
const toggleAction = () => {
  if (!isToggle) return
  if (formData.actionType === 'Mint') {
    formData.selectValue = formData.selectValue === 'WBTC' ? 'bHODL' : 'uHODL'
  } else {
    formData.selectValue = formData.selectValue === 'bHODL' ? 'WBTC' : 'USDC'
  }
  formData.amount = ''
}
const toToken = computed(() => {
  return tokensInfo[formData.selectValue].mapSymbol as SelectedTokens
})

const onToTokenUSD = computed(() => {
  return getTokenPrice(toToken.value).value || '0'
})

const actionFees = computed(() => {
  let fees = Big('0')
  if (formData.actionType === 'Redeem') {
    fees = Big(fee.value.hodlWithdrawFeeRatio || 0).div(100)
  }
  return new Big(formData.amount || 0).times(fees || 0).toFixed()
})
const actionFeesUSD = computed(() => {
  return (
    Big(actionFees.value || 0)
      .times(onToTokenUSD.value || 0)
      .toFixed() || '0'
  )
})

const buttonDisabled = computed(() => {
  let type
  const amountBig = new Big(formData.amount || 0)

  if (amountBig.toNumber() === 0) {
    type = 'disabled'
  } else if (amountBig.lt(formatWallet.value.min)) {
    type = 'lt'
  } else if (amountBig.gt(selectTokenBalance.value)) {
    type = 'gt'
  }

  return type
})
const formBtnText = computed(() => {
  let text = `${formData.actionType}`

  if (buttonDisabled.value === 'disabled') {
    return text
  } else if (buttonDisabled.value === 'lt') {
    text = 'Amount smaller than minimum'
  } else if (buttonDisabled.value === 'gt') {
    text = 'Insufficient Balance'
  }
  return text
})
const formatWallet = computed(() => {
  return {
    WBTC: balanceWBTC.value,
    USDC: balanceUSDC.value,
    bHODL: balanceBHODL.value,
    uHODL: balanceUHODL.value,
    min: '0.01',
  }
})
const selectTokenBalance = computed(() => {
  return (
    Big(formatWallet.value[formData.selectValue])
      .div(10 ** 18)
      .toFixed() || 0
  )
})

const onSubmit = async () => {
  loading.show()
  try {
    if (formData.actionType === 'Mint') {
      await deposit(toToken.value as 'bHODL' | 'uHODL')
    } else {
      await withdraw(formData.selectValue as 'bHODL' | 'uHODL')
    }
  } catch (error: any) {
    if (error.code !== 4001) {
      YMessage.error(error.message)
    }
    emits('on-error', { type: formData.actionType })
  }
  loading.hide()
}

// 创建hodl
const deposit = (hodlSymbol: 'uHODL' | 'bHODL') => {
  const amount = new Big(10)
    .pow(18)
    .times(formData.amount || 0)
    .toFixed()

  return txWithApprove(tokensInfo[hodlSymbol].mapSymbol, hodlSymbol, () =>
    apiDeposit(hodlSymbol, amount)
  )
    .then((bool) => {
      if (bool) {
        emits('on-success', { type: formData.actionType })
        YMessage.success('Action Succeeded')
      }
    })
    .catch((err) => {
      if (err.code !== 4001) {
        YMessage.error(err.message)
      }
      return Promise.reject(err)
    })
}

// 提取hodl为某个币种
const withdraw = (symbol: 'uHODL' | 'bHODL') => {
  const amount = new Big(10)
    .pow(tokensInfo[symbol].decimals!)
    .times(formData.amount || 0)
    .toFixed()
  // 这里参数是两个symbol没有写错
  return txWithApprove(symbol, symbol, () => apiWithdraw(symbol, amount))
    .then((bool) => {
      if (bool) {
        emits('on-success', { type: formData.actionType })
        YMessage.success('Action Succeeded')
      }
    })
    .catch((err) => {
      if (err.code !== 4001) {
        YMessage.error(err.message)
      }
      return Promise.reject(err)
    })
}
</script>
<style lang="postcss" scoped>
.y-create-hodl {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 100%;
  margin-top: -8px;

  & .button--max {
    font-size: 12px;
    font-weight: 600;
    line-height: 18px;
    color: var(--yellow);
    cursor: pointer;
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
  }
  & .from__fee {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 16px;
    font-size: 11px;
    font-weight: 400;
    line-height: 18px;

    &:first-child {
      font-size: 14px;
    }
  }

  & .row__transform {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 18px 0;
  }

  & .form__button {
    margin-top: 96px;
  }
}
</style>
