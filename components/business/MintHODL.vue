<template>
  <div v-if="props.modelValue" class="y-mint-hodl">
    <el-icon
      v-if="isSuccess"
      :size="24"
      class="mint__close"
      @click="handleClose()"
    >
      <Close></Close>
    </el-icon>

    <div class="mint__title">
      {{
        isSuccess ? 'Success!' : `Mint ${getTokenPair(props.from)} to continue`
      }}
    </div>
    <div class="mint__body">
      <template v-if="!isSuccess">
        <div class="mint__tokens">
          <div class="token__from token__item">
            <img :src="getTokenIcon(props.from)" class="item__icon" />
            <div class="item__amount">
              {{
                useTokenNumberFormat(toValue, { token: props.from }) +
                ' ' +
                props.from
              }}
            </div>
            <div class="item__balance">
              Balance:
              {{
                useTokenNumberFormat(selectTokenBalance, {
                  token: props.from,
                }) +
                ' ' +
                props.from
              }}
            </div>
          </div>
          <el-icon :size="24" class="token__arrow">
            <ElIconRight />
          </el-icon>
          <div class="token__to token__item">
            <img :src="getTokenIcon(toUnit)" alt="" class="item__icon" />
            <div class="item__amount">
              {{
                useTokenNumberFormat(toValue, { token: toUnit }) + ' ' + toUnit
              }}
            </div>
            <div class="item__balance">
              Balance: {{ toBalance }} {{ toUnit }}
            </div>
          </div>
        </div>
        <y-btn
          v-if="showApprove"
          class="mint__button"
          height="42"
          @click="doApprove"
        >
          Approve
        </y-btn>
        <y-btn
          class="mint__button"
          height="42"
          :disabled="!!buttonDisabled || showApprove"
          @click="onSubmit"
        >
          {{ formBtnText }}
        </y-btn>
        <div v-if="Big(toValue).gt(selectTokenBalance)" class="mint__error">
          *Insufficient amount
        </div>
      </template>
      <div v-else-if="successMintToken !== ''" class="mint__success">
        You have successfully minted
        <br />
        {{
          useTokenNumberFormat(successMintAmount, { token: successMintToken })
        }}
        {{ successMintToken }}!
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Big } from 'big.js'
import type { PropType } from 'vue'
import { Right as ElIconRight, Close } from '@element-plus/icons-vue'
import { deposit as apiDeposit } from 'deorderbook-sdk/ethereum/hodl'
import { YMessage, div18 } from '~/utils'
import { useWaitTx } from '~/composables/useWaitTx'

// [Init]
const { getTokenIcon, getTokenPair, getTokenBalance } = useTokens()
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  /** 转换为hodl需要花费的token */
  from: {
    type: String as PropType<'WBTC' | 'USDC'>,
    required: true,
  },
  /** from token数量 */
  fromAmount: {
    type: String,
    required: true,
  },
  /** 是否按需获取，如果是，则减去account余额部分 */
  isOnDemand: {
    type: Boolean,
    default: false,
  },
})
const isSuccess = ref(false)
const handleClose = () => {
  isSuccess.value = false
  successMintAmount.value = ''
  successMintToken.value = ''
  emits('update:modelValue', false)
}
const successMintAmount = ref('')
const successMintToken = ref('' as 'uHODL' | 'bHODL' | '')
const emits = defineEmits(['on-success', 'on-error', 'update:modelValue'])

const loading = useLoading()

const { tokensInfo, queryAllowance, approve } = useWallet()

// [ Approve ]
const showApprove = ref(false)
watch(
  [() => props.from, () => props.modelValue],
  async (newValue) => {
    if (['WBTC', 'USDC'].includes(newValue[0]) && newValue[1]) {
      const allowance = await queryAllowance(
        props.from,
        tokensInfo[props.from].mapSymbol
      )
      showApprove.value = Number(allowance) <= 0
    }
  },
  {
    immediate: true,
  }
)
const doApprove = () => {
  loading.show()
  approve(props.from, tokensInfo[props.from].mapSymbol)
    .then(() => {
      useNotify()
      showApprove.value = false
    })
    .finally(() => loading.hide())
}
// [Form]
const formData = reactive({
  actionType: 'Create',
})

const toUnit = computed(() => {
  return tokensInfo[props.from].mapSymbol as 'uHODL' | 'bHODL'
})
const toValue = computed(() => {
  return Big(props.fromAmount || 0)
    .minus(props.isOnDemand ? toBalanceOrigin.value : 0)
    .toFixed()
})

const toBalanceOrigin = computed(() => {
  return div18(getTokenBalance(toUnit.value).value)
})
const toBalance = computed(() => {
  return useTokenNumberFormat(toBalanceOrigin.value, {
    token: toUnit.value,
  })
})

watch(
  [() => props.from, toValue],
  () => {
    if (['USDC', 'WBTC'].includes(props.from) && Big(toValue.value).gt(0)) {
      handleClose()
      emits('update:modelValue', true)
    } else if (!isSuccess.value) {
      emits('update:modelValue', false)
    }
  },
  {
    immediate: true,
  }
)

const buttonDisabled = computed(() => {
  let type
  const amountBig = new Big(toValue.value || 0)

  if (amountBig.toNumber() === 0) {
    type = 'disabled'
  } else if (amountBig.gt(selectTokenBalance.value)) {
    type = 'gt'
  }
  return type
})
const formBtnText = computed(() => {
  return `Mint ${toUnit.value}`
})

const selectTokenBalance = computed(() => {
  return (
    Big(getTokenBalance(props.from).value || 0)
      .div(10 ** 18)
      .toFixed() || 0
  )
})

const onSubmit = async () => {
  loading.show()
  try {
    if (formData.actionType === 'Create') {
      await deposit(toUnit.value)
    }
  } catch (error: any) {
    if (error.code !== 4001) {
      YMessage.error(error.message)
    }
    emits('on-error', { type: formData.actionType })
    loading.hide()
  }
  loading.hide()
}

/**
 *
 * @param hodlSymbol
 */
const deposit = (hodlSymbol: 'bHODL' | 'uHODL') => {
  loading.show()
  const amount = new Big(10).pow(18).times(toValue.value).toFixed()
  return apiDeposit(hodlSymbol, amount)
    .then((resp) => {
      const { waitTx } = useWaitTx(resp)
      return waitTx().then(() => {
        successMintAmount.value = toValue.value
        successMintToken.value = hodlSymbol
        isSuccess.value = true
        emits('on-success', { type: hodlSymbol })
        useNotify()
      })
    })
    .catch((err) => {
      YMessage.error(err.message)
      return Promise.reject(err)
    })
    .finally(() => {
      loading.hide()
    })
}
</script>
<style lang="postcss" scoped>
.y-mint-hodl {
  position: relative;
  padding: 24px 16px 16px;
  background: #212126;
  border: 0.5px solid #4c4c4c;
  border-radius: 24px;
  & .mint__close {
    position: absolute;
    top: 12px;
    right: 12px;
    cursor: pointer;
    opacity: 0.5;
  }
  & .mint__success {
    margin-top: 16px;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 400;
    line-height: 18px;
    color: #ffffff;
    text-align: center;
    opacity: 0.6;
  }
  & .mint__title {
    font-size: 16px;
    font-weight: 600;
    line-height: 20px;
    text-align: center;
  }
  & .mint__tokens {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 32px;
    & .token__item {
      display: flex;
      flex: auto;
      flex-direction: column;
      align-items: center;
      padding: 12px 0;
      background: #2e2e32;
      border: 0.5px solid #777777;
      border-radius: 16px;
      & .item__icon {
        display: block;
        width: 24px;
        height: 24px;
        text-align: center;
      }
      & .item__amount {
        margin-top: 8px;
        font-size: 16px;
        font-weight: 600;
        line-height: 20px;
      }
      & .item__balance {
        margin-top: 4px;
        font-size: 11px;
        font-weight: 400;
        line-height: 18px;
        color: rgba(255, 255, 255, 0.6);
      }
    }
    & .token__arrow {
      margin: 0 8px;
      opacity: 0.2;
    }
  }
  & .mint__button {
    margin-top: 24px;
  }
  & .mint__error {
    margin-top: 4px;
    font-size: 11px;
    font-weight: 400;
    line-height: 18px;
    color: #de4238;
    text-align: center;
  }
}
</style>
