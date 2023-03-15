<template>
  <el-dialog
    ref="dialogRef"
    v-bind="$attrs"
    title="Withdraw"
    class="y-dialog y-dialog--lock"
    width="418px"
    center
  >
    <div class="wrap__token__input">
      <div class="wrap__token">
        <img src="~/assets/img/icon_coin_dob@2x.png" alt="" />
        <div class="txt__input__token">DOB</div>
      </div>
      <input
        class="input__lock"
        inputmode="decimal"
        title="Token Amount"
        autocomplete="off"
        type="number"
        pattern="^[0-9]*[.,]?[0-9]*$"
        placeholder="0"
        v-model="inputAmount"
        @input="inputChange"
      />
    </div>
    <y-percentage-selector
      width="100%"
      @percentChange="percentChange"
      v-model:percentProp="percent"
    ></y-percentage-selector>
    <div class="dialog__block-margin--top">
      <div
        v-for="(item, index) in dialogFormRow"
        :key="index"
        class="form__row"
      >
        <div class="row__label">{{ item.label }}</div>
        <div class="row__value">{{ item.value }}</div>
      </div>
    </div>
    <template #footer>
      <y-btn block bg :disabled="!withdrawButtonEnable" @click="unStake">
        Withdraw
      </y-btn>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import Big from 'big.js'
import { useDOBStore } from '~/store/dob'
import { useNumberLimit } from '~/composables/useNumberLimit'
const { txWithApprove, balanceDOB, formatCoin, isConnected } = useWallet()
const { userInfo } = toRefs(useDOBStore())

const emits = defineEmits(['on-success'])
const inputAmount = ref('')
const percent = ref(0)

const percentChange = (percent: number) => {
  inputAmount.value = useNumberLimit(
    Big(userInfo.value.totalStakingAmount).mul(percent).div(1e18).toFixed()
  ).value
}

const unStake = () => {}

const dialogFormRow = computed(() => {
  return [
    {
      label: 'Available to Withdraw',
      value: `${useTokenNumberFormat(
        formatCoin(userInfo.value.totalStakingAmount, 'DOB'),
        {
          token: 'DOB',
        }
      )} DOB`,
    },
    {
      label: 'Wallet Balance',
      value:
        useTokenNumberFormat(balanceDOB.value ?? '0', { token: 'DOB' }) +
        ' DOB',
    },
  ]
})

const withdrawButtonEnable = computed(() => {
  if (
    inputAmount.value === '' ||
    inputAmount.value === '0' ||
    Big(inputAmount.value).eq(0)
  ) {
    return false
  }
  return true
})

const inputChange = (value: any) => {
  inputAmount.value = value.target.value
  const valueIn = inputAmount.value === '' ? '0' : inputAmount.value
  if (Big(valueIn) && Big(balanceDOB.value ?? 0).gt(0)) {
    let percentage = Big(valueIn).mul(1e20).div(balanceDOB.value).toNumber()
    if (percentage > 100) {
      percentage = 100
    }
    percent.value = percentage
  }
}
</script>

<style lang="postcss">
.y-dialog--lock.el-dialog {
  background: radial-gradient(
    49.67% 49.67% at 88.76% 5.88%,
    #323232 0%,
    #26262b 95.31%
  );
  border: 0.5px solid #4d4d4d;
  border-radius: 16px;

  & .wrap__token__input {
    box-sizing: border-box;

    display: flex;
    flex-direction: column;
    flex-flow: row nowrap;
    gap: 10px;
    align-items: flex-start;
    align-items: center;
    justify-content: space-between;

    width: 370px;
    height: 72px;
    padding: 24px 16px;

    background: #212126;
    border: 0.5px solid #777777;
    border-radius: 16px;
    box-shadow: inset 0px 0px 6px #141414;
    -webkit-box-align: center;
    -webkit-box-pack: justify;

    & .wrap__token {
      display: flex;
      flex-direction: row;
      gap: 8px;
      align-items: center;
      width: fit-content;
      padding: 0px;

      & img {
        width: 24px;
        height: 24px;
      }

      & .txt__input__token {
        width: 35px;
        height: 20px;
        font-family: 'Poppins';
        font-size: 16px;
        font-style: normal;
        font-weight: 600;
        line-height: 20px;
        color: #ebebf8;
      }
    }

    & .input__lock {
      height: 20px;

      font-family: 'Poppins';
      font-size: 20px;
      font-style: normal;
      font-weight: 700;
      line-height: 22px;
      color: #ffffff;
      text-align: right;
      text-overflow: ellipsis;
      white-space: nowrap;
      background-color: transparent;
      border: none;
      outline: none;

      opacity: 1;
      appearance: textfield;

      &::placeholder {
        opacity: 0.2;
      }
    }
  }

  & .el-dialog__body {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding-bottom: 0;

    & .dialog__block-margin--top {
      display: flex;
      flex-direction: column;
      gap: 16px;

      font-family: 'Poppins';
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      line-height: 18px;

      & .form__row {
        display: flex;
        justify-content: space-between;

        & .row__label {
        }

        & .row__value {
          font-size: 16px;
          font-weight: 600;
          line-height: 20px;
          text-align: right;
        }
      }
    }
  }
}
</style>
