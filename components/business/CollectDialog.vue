<template>
  <y-dialog
    ref="elRef"
    v-bind="{ ...$attrs, ...props }"
    :model-value="props.modelValue"
    class="y-collect-dialog"
    @close="(e) => $emit('update:modelValue', false)"
  >
    <div class="dialog__body">
      <div class="row__amount body__row">
        <div class="row__left">Amount</div>
        <div class="row__right">
          <div>
            {{
              useTokenNumberFormat(div18(props.matchingAllSniperAmount), {
                token: 'SNIPER',
              })
            }}
          </div>
          <!-- <div class="row__subtext">{{ tokenUSD }}</div> -->
        </div>
      </div>
      <div class="row__date body__row">
        <div class="row__left">Expiry Date</div>
        <div class="row__right">
          <div>{{ dayjs(Number(props.timestamp)).format('MMM. D, YYYY') }}</div>
          <div v-if="dayLeft > 0" class="row__subtext">≈{{ dayLeft }} days</div>
        </div>
      </div>
      <div class="row__apr body__row">
        <div class="row__left">Current vAPR</div>
        <div class="row__right">{{ props.apr }}</div>
      </div>
      <y-slider
        v-model="sliderNumber"
        :total="div18(maxCollectAmount)"
        token="SNIPER"
        unit="SNIPER"
      ></y-slider>
    </div>
    <div class="dialog__buttons">
      <y-btn bg height="48" :disabled="submitDisable" @click="onSubmit">
        Collect
      </y-btn>
      <!-- <y-btn bg color-type="grey" height="68">{{ 'Claiming' }}</y-btn> -->
    </div>
  </y-dialog>
</template>
<script setup lang="ts">
import { Big } from 'big.js'
import { withdrawTarget } from 'deorderbook-sdk/ethereum/option'
import dayjs from 'dayjs'
import type { DialogProps } from 'element-plus'
import { dialogProps } from 'element-plus'
import { PropType } from 'vue'
import { numberFormat, div18, YMessage } from '~/utils'

// 父组件通过ref.value.elRef.xxx调用element-ui组件方法
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  appendToBody: {
    type: Boolean,
    default: true,
  },
  matchingSniperAmount: {
    type: String,
    default: '0',
  },
  timestamp: {
    type: String,
    default: '0',
  },
  apr: {
    type: String,
    default: '0%',
  },
  sniper: {
    type: String,
    default: '',
  },
  optionAddress: {
    type: String,
    default: '',
  },
  matchingAllSniperAmount: {
    type: String,
    default: '0',
  },
})
const { pageInit } = usePageInit()
const { matchingAllSniperAmount: maxCollectAmount } = toRefs(props)
const loading = useLoading()
const elRef = ref(null)
const sliderNumber = ref(50)

const collectAmount = computed(() => {
  return Big(div18(maxCollectAmount.value))
    .times(sliderNumber.value)
    .div(100)
    .toFixed()
})
const dayLeft = computed(() => {
  return Math.ceil((Number(props.timestamp) - Date.now()) / 1000 / 60 / 60 / 24)
})
const submitDisable = computed(() => {
  return Number(collectAmount.value) <= 0
})
const { doCollect } = useSniperCollect({
  exerciseTimestamp: props.timestamp,
  sniper: props.sniper,
  address: props.optionAddress,
})
const onSubmit = async () => {
  loading.show()
  await doCollect(
    Big(collectAmount.value)
      .times(10 ** 18)
      .toFixed()
  )
  emits('update:modelValue', false)
  pageInit()
}

const emits = defineEmits(['update:modelValue']) // 不要添加defineEmits，会阻断子组件触发事件
</script>
<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>
<style lang="postcss" scoped>
.y-collect-dialog {
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
