<template>
  <y-dialog
    ref="elRef"
    v-bind="{ ...$attrs, ...props }"
    :model-value="props.modelValue"
    class="y-sniper-stake-dialog"
    @close="emits('update:modelValue', false)"
  >
    <div class="dialog__body">
      <div class="row__amount body__row">
        <div class="row__left">Amount</div>
        <div class="row__right">
          <div>
            {{ useTokenNumberFormat(div18(maxAmount), { token: 'SNIPER' }) }}
          </div>
          <!-- <div class="row__subtext">{{ tokenUSD }}</div> -->
        </div>
      </div>
      <div class="row__date body__row">
        <div class="row__left">Expiry Date</div>
        <div class="row__right">
          <div>
            {{
              dayjs(Number(sniperData.exerciseTimestamp)).format('MMM. D, YYYY')
            }}
          </div>
          <div v-if="dayLeft > 0" class="row__subtext">≈{{ dayLeft }} days</div>
        </div>
      </div>
      <div class="row__apr body__row">
        <div class="row__left">Current vAPR</div>
        <div class="row__right">{{ sniperData.aprString }}</div>
      </div>
      <y-slider
        v-model="sliderNumber"
        :total="div18(maxAmount)"
        token="SNIPER"
        unit="SNIPER"
      ></y-slider>
    </div>
    <div class="dialog__buttons">
      <y-btn bg height="48" :disabled="submitDisable" @click="onSubmit">
        {{ type }}
      </y-btn>
      <!-- <y-btn bg color-type="grey" height="68">{{ 'Claiming' }}</y-btn> -->
    </div>
  </y-dialog>
</template>
<script setup lang="ts">
import { Big } from 'big.js'
import dayjs from 'dayjs'
import { PropType } from 'vue'
import { stake, unstake } from 'deorderbook-sdk/ethereum/staking_pool'
import { StakingPoolsAddress } from 'deorderbook-sdk'
import { div18, YMessage } from '~/utils'
import { FormattedOptionAccount } from '~/types/options'
const { pageInit } = usePageInit()
// 父组件通过ref.value.elRef.xxx调用element-ui组件方法
const props = defineProps({
  // [ element-plus props]
  modelValue: {
    type: Boolean,
    default: false,
  },
  destroyOnClose: {
    type: Boolean,
    default: true,
  },
  appendToBody: {
    type: Boolean,
    default: true,
  },
  // [ costume props ]
  type: {
    type: String as PropType<'Stake' | 'Unstake'>,
    default: 'Stake',
  },
  id: {
    type: String,
    default: '',
  },
  sniperData: {
    type: Object as PropType<FormattedOptionAccount>,
    required: true,
  },
})
const { sniperData } = toRefs(props)
const maxAmount = computed(() => {
  return props.type === 'Stake'
    ? sniperData.value.matchingSniperAmount
    : sniperData.value.stakedAmount
})
const loading = useLoading()
const elRef = ref(null)
const sliderNumber = ref(50)

const amount = computed(() => {
  return Big(maxAmount.value).times(sliderNumber.value).div(100).toFixed()
})
const dayLeft = computed(() => {
  return Math.ceil(
    (Number(sniperData.value.exerciseTimestamp) - Date.now()) /
      1000 /
      60 /
      60 /
      24
  )
})
const submitDisable = computed(() => {
  return Number(amount.value) <= 0
})
const doStake = () => {
  loading.show()
  // fromToken为sniper地址
  const fromToken = sniperData.value?.sniper
  const toToken = StakingPoolsAddress
  const { txWithApprove } = useWallet()

  txWithApprove(
    fromToken,
    toToken,
    () => stake(props.id, amount.value),
    'sniperContracts'
  )
    .then((bool) => {
      if (bool) {
        emits('update:modelValue', false)
        pageInit()
        YMessage.success('Action Succeed')
      }
      loading.hide()
    })
    .catch((err) => {
      if (err.code !== 4001) {
        YMessage.error(err.message)
      }
      loading.hide()
    })
}
const doUnstake = () => {
  unstake(props.id, amount.value)
    .then((hash) => {
      if (hash instanceof Object) {
        hash = hash?.transactionHash
      }
      const { waitTx } = useWaitTx(hash)
      return waitTx()
        .then((bool) => {
          if (bool) {
            emits('update:modelValue', false)
            pageInit()
            YMessage.success('Action Succeed')
          } else {
            YMessage.error('Action Failed')
          }
        })
        .catch((err) => {
          if (err.code !== 4001) {
            YMessage.error(err.message)
          }
        })
    })
    .catch((err) => {
      if (err.code !== 4001) {
        YMessage.error(err.message)
      }
    })
    .finally(() => {
      loading.hide()
    })
}
const onSubmit = () => {
  loading.show()
  if (props.type === 'Unstake') {
    doUnstake()
  } else {
    doStake()
  }
}

const emits = defineEmits(['update:modelValue'])
</script>
<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>
<style lang="postcss" scoped>
.y-sniper-stake-dialog {
  & .dialog__body {
    & .body__row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      &:not(:first-child) {
        margin-top: 26px;
      }
      & .row__left {
        font-size: 14px;
        font-weight: 400;
        line-height: 18px;
      }
      & .row__right {
        font-size: 16px;
        font-weight: 600;
        line-height: 20px;
        text-align: right;
      }
    }
    & :deep(.y-slider) {
      margin-top: 24px;
    }
    & .row__subtext {
      margin-top: 2px;
      font-size: 11px;
      font-weight: 400;
      line-height: 18px;
      text-align: right;
      opacity: 0.5;
    }
  }

  & .dialog__buttons {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    & > button {
      margin-top: 24px;
    }
  }
}
</style>
