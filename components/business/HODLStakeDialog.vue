<template>
  <y-dialog
    ref="elRef"
    v-bind="{ ...$attrs, ...props }"
    :model-value="props.modelValue"
    class="y-sniper-stake-dialog"
    :title="type + ' ' + fromToken"
    @close="emits('update:modelValue', false)"
  >
    <div class="dialog__body">
      <div class="row__amount body__row">
        <div class="row__left">Available</div>
        <div class="row__right">
          <div>
            {{
              useTokenNumberFormat(div18(available), { token: props.fromToken })
            }}
          </div>
          <div class="row__subtext">
            {{
              useUSDFormat(div18(availableUSD), {
                showApprox: true,
              })
            }}
          </div>
        </div>
      </div>
      <div class="row__total-staked body__row">
        <div class="row__left">Total Staked</div>
        <div class="row__right">
          <div>
            {{
              useTokenNumberFormat(div18(currentHODLPool?.stakedAmount ?? 0), {
                token: fromToken,
              })
            }}
          </div>
          <div class="row__subtext">
            {{
              useUSDFormat(currentHODLPool?.stakedAmountUSD ?? '0', {
                showApprox: true,
              })
            }}
          </div>
        </div>
      </div>
      <div class="row__my-staked body__row">
        <div class="row__left">My Staked</div>
        <div class="row__right">
          <div>
            {{
              useTokenNumberFormat(div18(currentUserHODLPool?.staked ?? 0), {
                token: fromToken,
              })
            }}
          </div>
          <div class="row__subtext">
            {{
              useUSDFormat(currentUserHODLPool?.stakedUSD ?? 0, {
                showApprox: true,
              })
            }}
          </div>
        </div>
      </div>
      <div class="row__apr body__row">
        <div class="row__left">Current vAPR</div>
        <div class="row__right">{{ currentHODLPool?.aprString }}</div>
      </div>
      <y-slider
        v-model="sliderNumber"
        :total="div18(available)"
        :token="props.fromToken"
        :unit="props.fromToken"
      ></y-slider>
    </div>
    <div class="dialog__buttons">
      <y-btn bg height="48" :disabled="submitDisable" @click="onSubmit">
        {{ type }}
      </y-btn>
    </div>
    <template v-if="(currentUserHODLPool?.rewardDOBAmount ?? '0') !== '0'">
      <div class="row__dob-reward body__row">
        <div class="row__left">Accumulated DOB</div>
        <div class="row__right">
          <div>
            DOB
            {{
              useTokenNumberFormat(
                div18(currentUserHODLPool?.rewardDOBAmount ?? 0),
                {
                  token: 'DOB',
                }
              )
            }}
          </div>
          <div class="row__subtext">
            {{
              useUSDFormat(currentUserHODLPool?.rewardDOBAmountUSD ?? '0', {
                showApprox: true,
              })
            }}
          </div>
        </div>
      </div>
      <div class="claim__button">
        <y-btn bg @click="handleClaim">Claim</y-btn>
      </div>
    </template>
  </y-dialog>
</template>
<script setup lang="ts">
import { Big } from 'big.js'
import { dialogProps } from 'element-plus'
import { PropType } from 'vue'
import { div18 } from '~/utils'
import { useHODLStore } from '~/store/hodl'
import { FormattedHODLPool, FormattedUserHODLPool } from '~/types/hodl'
import { useHODLClaim } from '~/composables/useHODLClaim'

const { pageInit } = usePageInit()
const props = defineProps({
  ...({
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
  } as unknown as typeof dialogProps),
  type: {
    type: String as PropType<'Stake' | 'Unstake'>,
    default: 'Stake',
  },
  fromToken: {
    type: String as PropType<'uHODL' | 'bHODL'>,
    default: '',
  },
})

const { hodlPools, userHODLPools } = toRefs(useHODLStore())
const { doClaim } = useHODLClaim({
  symbol: props.fromToken,
})

const currentHODLPool = computed((): FormattedHODLPool | undefined => {
  return hodlPools.value.find((pool) => {
    return props.fromToken === pool.type
  })
})

const currentUserHODLPool = computed((): FormattedUserHODLPool | undefined => {
  return userHODLPools.value.find((hodlPoolAccount) => {
    return props.fromToken === hodlPoolAccount.type
  })
})

const wallet = useWalletStore()
const available = computed(() => {
  const available =
    props.type === 'Stake'
      ? currentUserHODLPool.value?.balance ?? '0'
      : currentUserHODLPool.value?.staked ?? '0'
  if (available === '0') {
    sliderNumber.value = 0
  }
  return available
})
const availableUSD = computed(() => {
  return props.type === 'Stake'
    ? currentUserHODLPool.value?.balanceUSD ?? '0'
    : currentUserHODLPool.value?.stakedUSD ?? '0'
})

const loading = useLoading()
// 父组件通过ref.value.elRef.xxx调用element-plus组件方法
const elRef = ref(null)
const sliderNumber = ref(50)

const amount = computed(() => {
  return Big(available.value).times(sliderNumber.value).div(100).toFixed(0)
})

const submitDisable = computed(() => {
  return Number(amount.value) <= 0
})
const doStake = async () => {
  loading.show()
  const { startStake } = useHODLStake()
  await startStake(props.fromToken, amount.value)
  pageInit()
  emits('update:modelValue', false)
}
const doUnstake = async () => {
  const { unStake } = useHODLUnStake()
  loading.show()
  await unStake(props.fromToken, amount.value)
  pageInit()
  emits('update:modelValue', false)
}
const onSubmit = () => {
  if (props.type === 'Unstake') {
    doUnstake()
  } else {
    doStake()
  }
}

const handleClaim = async () => {
  await doClaim()
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
  & .row__apr {
    margin-bottom: 72px;
  }
  & .dialog__buttons {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    & > button {
      margin-top: 32px;
    }
  }
  & .row__dob-reward.body__row {
    margin-top: 73px;
  }
  & .claim__button {
    margin-top: 15px;
  }
}
</style>
