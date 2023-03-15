<template>
  <y-dialog
    title="Exercise"
    width="490px"
    :model-value="props.modelValue"
    :show-close="false"
    destroy-on-close
    @close="emits('update:modelValue', false)"
  >
    <y-token-bullet-form
      :model-value="bulletAmount"
      :select="bulletSelect"
      select-readonly
      :select-options="['uBULLET', 'bBULLET']"
      :balance="bulletBalance"
      :bullet-address="bullet"
      balance-label="Available"
      :exercise-timestamp="timestamp"
      :strike-price="strikePrice"
      @update:model-value="onBulletAmountInput"
    ></y-token-bullet-form>
    <y-token-form
      :model-value="fromHODLAmount"
      :select="fromHODLSelect"
      select-readonly
      :select-options="['uHODL', 'bHODL']"
      balance-label="Available"
      class="form__hodl"
      @update:model-value="onFromHODLInput"
    ></y-token-form>
    <YMintHODL
      v-model="showMintHODL"
      :from="getTokenPair(fromHODLSelect)"
      :from-amount="fromHODLAmount"
      :is-on-demand="true"
      class="form__mint"
    ></YMintHODL>
    <div class="form__swap" @click="goDex(mintFromToken)">
      <div>Go to {{ marketName }} to get {{ mintFromToken }}</div>
      <el-icon :size="16"><TopRight /></el-icon>
    </div>
    <div class="form__arrow">
      <el-icon :size="16" color="#6D6D77"><Sort /></el-icon>
    </div>
    <y-token-form
      ref="toHODLRef"
      v-model="toHODLAmount"
      :select="toHODLSelect"
      select-readonly
      :select-options="['uHODL', 'bHODL']"
      input-readonly
      :show-max="false"
      class="to__hodl"
    ></y-token-form>
    <y-btn v-if="showApprove" bg class="form__submit" @click="doApprove">
      Allow DeOrderBook to use your {{ fromHODLSelect }}
    </y-btn>
    <y-btn
      bg
      :disabled="submitDisable"
      class="form__submit"
      @click="handleExercise"
    >
      Exercise
    </y-btn>
    <div class="form__fee">
      <div>Fees</div>
      <div>
        {{ useTokenNumberFormat(toHODLFee, { token: toHODLSelect }) + ' '
        }}{{ toHODLSelect + ' ' }}({{
          useUSDFormat(toHODLFeeUSD, { showApprox: true })
        }})
      </div>
    </div>
  </y-dialog>
</template>
<script setup lang="ts">
import { PropType } from 'vue'
import { Big } from 'big.js'
import { TopRight, Sort } from '@element-plus/icons-vue'
import { div18 } from '~/utils'
import YTokenForm from '~/components/business/TokenForm.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  optionType: {
    type: String as PropType<'0' | '1'>,
    required: true,
  },
  timestamp: {
    type: String as PropType<`${number}` | string>,
    required: true,
  },
  token: {
    type: String as PropType<'bBULLET' | 'uBULLET'>,
    default: '',
  },
  bullet: {
    type: String,
    default: '',
  },
  bulletBalance: {
    type: String,
    default: '0',
  },
  strikePrice: {
    type: String,
    default: '0',
  },
  optionAddress: {
    type: String,
    default: '',
  },
})
const { marketName, goDex } = useDex()
const { bullet, optionAddress, optionType, timestamp, strikePrice } =
  toRefs(props)
const emits = defineEmits(['update:modelValue'])

// [ BULLET ]
const bulletSelect = ref(props.token)
const bulletAmount = ref(
  useNumberLimit(div18(props.bulletBalance) as `${number}`)
)
const onBulletAmountInput = (v) => {
  bulletAmount.value = v

  const amount = Big(v || 0)
  const price = div18(props.strikePrice)
  const num =
    fromHODLSelect.value === 'uHODL' ? amount.times(price) : amount.div(price)
  fromHODLAmount.value = useNumberLimit(num.toFixed() as `${number}`).value
}
const bulletBalance = ref(useNumberLimit(div18(props.bulletBalance || '0')))

// [ From HODL]
const fromHODLSelect = computed(() => {
  return props.token === 'bBULLET' ? 'uHODL' : 'bHODL'
})
const fromHODLAmount = ref('0')
onBulletAmountInput(bulletAmount.value)
const onFromHODLInput = (v) => {
  fromHODLAmount.value = v

  const amount = Big(v || 0)
  const price = div18(props.strikePrice)
  const num =
    fromHODLSelect.value === 'uHODL' ? amount.div(price) : amount.times(price)
  bulletAmount.value = num.toFixed() as `${number}`
}
// mint
const showMintHODL = ref(false)
const mintFromToken = computed(() => {
  return getTokenPair(fromHODLSelect.value)
})

// [ To HODL ]
const toHODLRef = ref<InstanceType<typeof YTokenForm> | null>(null)
const { exerciseFeeRatio } = useOptionFee(optionAddress)
const toHODLSelect = computed(() => {
  return props.token === 'bBULLET' ? 'bHODL' : 'uHODL'
})
const toHODLAmount = computed(() => {
  return useNumberLimit(
    Big(bulletAmount.value || 0)
      .times(Big(1).sub(exerciseFeeRatio.value || '0'))
      .toFixed() as `${number}`
  ).value
})
const toHODLFee = computed(() => {
  return Big(bulletAmount.value || 0)
    .times(exerciseFeeRatio.value || '0')
    .toFixed()
})
const { getTokenPair, getTokenPrice } = useTokens()
const toHODL1USD = computed(() => {
  return getTokenPrice(toHODLSelect.value).value
})
const toHODLFeeUSD = computed(() => {
  return Big(toHODLFee.value).times(toHODL1USD.value)
})
// [ Submit ]
const handleExercise = () => {
  doExercise()
    .then(() => {
      emits('update:modelValue', false)
      usePageInit().pageInit()
    })
    .finally()
}
const { submitDisable, doExercise, showApprove, doQueryAllowance, doApprove } =
  useOptionExercise({
    optionType,
    optionAddress,
    exerciseTimestamp: timestamp.value as `${number}`,
    bulletAmount,
    bulletAddress: unref(bullet),
    bulletBalance,
    strikePrice,
  })
watch(
  optionAddress,
  () => {
    doQueryAllowance()
  },
  { immediate: true }
)
</script>
<style lang="postcss" scoped>
.form__hodl {
  margin-top: 24px;
}
.form__mint {
  margin-top: 46px;
}
.form__swap {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  color: #ffffff;
  text-decoration-line: underline;
  cursor: pointer;
  opacity: 0.6;
  & :deep(.el-icon) {
    margin-left: 4px;
    opacity: 0.6;
  }
}
.form__arrow {
  margin-top: 24px;
  text-align: center;
}
.to__hodl {
  margin-top: 24px;
}
.form__submit {
  margin-top: 15px;
}
.form__fee {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 15px;
  font-size: 14px;
  line-height: 18px;
  &:last-child {
    font-size: 11px;
    line-height: 18px;
  }
}
</style>
