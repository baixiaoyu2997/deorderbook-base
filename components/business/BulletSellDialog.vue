<template>
  <y-dialog
    title="BULLET SELL"
    :model-value="props.modelValue"
    class="wrap__dialog"
  >
    <div class="wrap__input">
      <div class="wrap__row">
        <div class="wrap__token">
          <img :src="getTokenIcon(props.data.type)" />
          {{ props.data.type }}
        </div>
        <input
          v-model="inputSellBulletAmount"
          autocomplete="off"
          pattern="^[0-9]*[.,]?[0-9]*$"
          placeholder="0"
          @input="inputSellChange"
        />
      </div>
      <div class="wrap__row">
        <div class="left">
          Available:
          {{
            useTokenNumberFormat(div18(props.data.amount), { token: 'bBULLET' })
          }}
          bBULLET
          <span @click="clickMaxSell">MAX</span>
        </div>
        <!--        <div class="right">(OTC Reference price)<br>≈ ${{ otcReferencePrice }}</div>-->
      </div>
    </div>
    <div style="text-align: center">
      <img class="icon__exchange" src="~/assets/img/icon_exchange.png" />
    </div>
    <div class="wrap__input">
      <div class="wrap__row">
        <div class="wrap__token">
          <img :src="getTokenIcon('uHODL')" />
          uHODL
        </div>
        <input
          v-model="inputQuoteValue"
          autocomplete="off"
          pattern="^[0-9]*[.,]?[0-9]*$"
          placeholder="0"
          @input="inputQuoteChange"
        />
      </div>
      <div class="wrap__row">
        <div class="left">1 uHODL = 1 USDC (≈ $1)</div>
        <div class="right">
          {{ useUSDFormat(inputQuoteValue, { showApprox: true }) }}
        </div>
      </div>
    </div>
    <div class="row">
      <div class="txt__title">Reference OTC Price</div>
      <div class="wrap__value">
        <div class="txt__value">{{ otcReferencePrice }} uHODL</div>
        <div class="txt__note">≈ ${{ otcReferencePrice }}</div>
      </div>
    </div>
    <div class="row">
      <div class="txt__title">OTC Open Time</div>
      <div class="wrap__ask__price">
        <div class="wrap__price__column">
          <div class="wrap__input">
            <input
              v-model="inputOTCOpenHours"
              autocomplete="off"
              pattern="^[0-9]*[.,]?[0-9]*$"
              placeholder="0"
            />
            <span>h</span>
          </div>
        </div>
        <div class="wrap__price__column">
          <div class="wrap__input">
            <input
              v-model="inputOTCOpenMins"
              autocomplete="off"
              pattern="^[0-9]*[.,]?[0-9]*$"
              placeholder="0"
            />
            <span>m</span>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="txt__title">Ask Price</div>
      <div class="wrap__ask__price">
        <div class="wrap__price__column">
          <div class="txt__note">% of Reference</div>
          <div class="wrap__input">
            <input
              v-model="inputReferencePricePercent"
              autocomplete="off"
              pattern="^[0-9]*[.,]?[0-9]*$"
              placeholder="0"
              disabled
              @input="inputReferencePricePercentChange"
            />
            <span>%</span>
          </div>
        </div>
        <div class="wrap__price__column">
          <div class="txt__note">Price in uHODL</div>
          <div class="wrap__input">
            <input
              v-model="inputPrice"
              autocomplete="off"
              pattern="^[0-9]*[.,]?[0-9]*$"
              placeholder="0"
              disabled
            />
            <span></span>
          </div>
          <div class="txt__note">
            {{ useUSDFormat(inputPrice, { showApprox: true }) }}
          </div>
        </div>
      </div>
    </div>
    <y-percentage-selector
      v-model:percentProp="sliderPercentage"
      width="100%"
      :max-percentage="200"
      item-number="9"
      style="margin-top: 24px"
      @percentChange="percentChange"
      @onSelect="handlePercentageChange"
    ></y-percentage-selector>
    <y-btn
      style="margin-top: 40px"
      bg
      color-type="red"
      :disabled="sellButtonDisabled"
      v-loading="selling"
      @click="clickSell"
    >
      <span>Sell</span>
    </y-btn>
    <!--    <div class="row" style="margin-top: 16px">-->
    <!--      <div>Fees</div>-->
    <!--      <div>5 USDC (≈ $5)</div>-->
    <!--    </div>-->
  </y-dialog>
</template>
<script setup lang="ts">
import { PropType } from 'vue'
import Big from 'big.js'
import { uHODLAddress } from 'deorderbook-sdk'
import { useMarketBulletContract } from 'deorderbook-sdk/store/marketBulletContract'
import { offer as marketOffer } from 'deorderbook-sdk/ethereum/market_bullet'
import { div18, YMessage } from '~/utils'
import { useOptionAccountsStore } from '~/store/optionAccounts'
import Input from '~/components/form/Input.vue'
import { useTokensStore } from '~/store/tokens'
import { useNumberLimit } from '~/composables/useNumberLimit'
import { number } from '@/utils/number'
import { useWallet } from '~/composables/useWallet'
import { FormattedBullet } from '@/types/options'
import useUSDFormat from '~/composables/useUSDFormat'
import useTokenNumberFormat from '~/composables/useTokenNumberFormat'

const emits = defineEmits(['onSellFinished'])
const { tokenBBullet, tokenUBullet, tokenUHODL } = toRefs(useTokensStore())
const { getTokenIcon } = useTokens()
const props = defineProps({
  data: Object as PropType<FormattedBullet>,
})

onMounted(() => {
  priceOriginal.value =
    props.data!.type === 'uBULLET'
      ? tokenUBullet.value.priceUSD
      : tokenBBullet.value.priceUSD
})

const inputSellBulletAmount = ref(div18(props.data!.amount) as string)
const inputSellChange = (value: { target: { value: string } }) => {
  const inputNumber = Number(value.target.value) ?? 0
  inputQuoteValue.value = Big(inputNumber).mul(priceOriginal.value).toFixed()
}

const priceOriginal = ref(
  props.data!.type === 'uBULLET'
    ? tokenUBullet.value.priceUSD
    : tokenBBullet.value.priceUSD
)
const otcReferencePrice = computed(() => {
  return props.data!.type === 'uBULLET'
    ? tokenUBullet.value.priceUSD
    : tokenBBullet.value.priceUSD
})
const focusOn = ref<'inputQuote' | 'inputPercentage' | 'inputSlider' | ''>('')
const inputQuoteValue = ref(
  Big(inputSellBulletAmount.value).mul(priceOriginal.value).toFixed()
)
const inputQuoteChange = (value: { target: { value: any } }) => {
  focusOn.value = 'inputQuote'
  const input = Number(value.target.value)
    ? Number(value.target.value).toString()
    : '0'
  const sellAmount = Number(inputSellBulletAmount.value)
    ? Number(inputSellBulletAmount.value).toString()
    : '0'
  if (Big(sellAmount).gt(0)) {
    priceOriginal.value = Big(input).div(sellAmount).toFixed()
  }
}
const inputReferencePricePercent = ref('100')
const inputReferencePricePercentChange = (value: {
  target: { value: any }
}) => {
  focusOn.value = 'inputPercentage'
  if (Number(value.target.value)) {
    priceOriginal.value = (Number(value.target.value) ?? 0).toString()
  }
}
const sliderPercentage = ref(100)
const handlePercentageChange = (value: number) => {
  percentChange(value)
}
const percentChange = (value: number) => {
  focusOn.value = 'inputSlider'
  if (props.data!.type === 'uBULLET') {
    priceOriginal.value = Big(value)
      .mul(tokenUBullet.value.priceUSD)
      .div(100)
      .toFixed()
  } else if (props.data!.type === 'bBULLET') {
    priceOriginal.value = Big(value)
      .mul(tokenBBullet.value.priceUSD)
      .div(100)
      .toFixed()
  }
  inputReferencePricePercent.value = value.toString()
}
const inputPrice = ref(priceOriginal.value)
watch(priceOriginal, () => {
  if (focusOn.value === 'inputQuote') {
    if (
      Number(inputSellBulletAmount.value) &&
      Number(inputSellBulletAmount.value) > 0
    ) {
      inputPrice.value = number(
        Big(Number(inputQuoteValue.value) ?? 0).div(
          Number(inputSellBulletAmount.value)
        )
      )
    }
    if (Big(otcReferencePrice.value).gt(0)) {
      inputReferencePricePercent.value = Big(inputPrice.value)
        .div(otcReferencePrice.value)
        .mul(100)
        .toFixed(0)
    }
    sliderPercentage.value = Number(inputReferencePricePercent.value)
  } else if (focusOn.value === 'inputSlider') {
    if (
      Number(inputSellBulletAmount.value) &&
      Number(inputSellBulletAmount.value) > 0
    ) {
      inputQuoteValue.value = number(
        Big(inputSellBulletAmount.value).mul(priceOriginal.value)
      )
    }
    inputPrice.value = priceOriginal.value
  }
})

const inputOTCOpenHours = ref(23)
const inputOTCOpenMins = ref(58)

const { marketName, goDex } = useDex()
const bulletAmount = ref(useNumberLimit(div18(props.data?.amount ?? 0)))

const clickMaxSell = () => {
  inputSellBulletAmount.value = div18(props.data!.amount)
}

const { actionRefreshOptionAccounts } = useOptionAccountsStore()

const selling = ref(false)
const { txWithApprove } = useWallet()
const clickSell = () => {
  selling.value = true
  txWithApprove(
    props.data!.bullet,
    useMarketBulletContract().options.address,
    () =>
      marketOffer(
        Big(inputSellBulletAmount.value).mul(1e18).toFixed(),
        props.data!.bullet,
        Big(inputQuoteValue.value).mul(1e18).toFixed(),
        uHODLAddress,
        Date.now() +
          (Number(inputOTCOpenHours.value) ?? 0) * 3600000 +
          (Number(inputOTCOpenMins.value) ?? 0) * 60000
      ),
    'erc20Contracts'
  )
    .then((bool) => {
      if (bool) {
        resetInput()
        actionRefreshOptionAccounts(true)
        YMessage.success('Action Succeeded')
        emits('onSellFinished')
      } else {
        YMessage.error('Action Failed')
      }
    })
    .catch((err) => {
      if (err.code !== 4001) {
        YMessage.error(err.message)
        console.error(err)
      }
    })
    .finally(() => {
      selling.value = false
    })
}

const resetInput = () => {
  inputSellBulletAmount.value = '0'
}

const sellButtonDisabled = computed(() => {
  if ((Number(inputSellBulletAmount.value) ?? 0) <= 0) {
    return true
  }
  if ((Number(inputQuoteValue.value) ?? 0) <= 0) {
    return true
  }
  if (Big(inputSellBulletAmount.value).mul(1e18).gt(props.data!.amount)) {
    return true
  }
  if (
    (Number(inputOTCOpenHours.value) ?? 0) +
      (Number(inputOTCOpenMins.value) ?? 0) <=
    0
  ) {
    return true
  }
  return false
})
</script>
<style lang="postcss" scoped>
.wrap__dialog {
  display: flex;
  flex-direction: column;
  gap: 24px;
  text-align: center;

  & .icon__exchange {
    width: 24px;
    height: 24px;
    margin: 24px auto;
  }

  & .wrap__input {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px 16px;

    background: #212126;
    border: 1px solid rgba(120, 120, 120, 0.2);
    border-radius: 16px;
    box-shadow: inset 0px 0px 6px #141414;

    & .wrap__row {
      display: flex;
      gap: 14px;
      justify-content: space-between;

      & input {
        max-width: 50%;
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

      & .wrap__token {
        display: flex;
        gap: 8px;
        padding: 6px 8px;
        font-family: 'Poppins';
        font-size: 16px;
        font-style: normal;
        font-weight: 600;
        line-height: 24px;
        color: #ffffff;
        background: #26262b;
        border: 1px solid rgba(120, 120, 120, 0.2);
        border-radius: 60px;

        & img {
          width: 24px;
          height: 24px;
        }
      }

      & .left {
        display: flex;
        gap: 8px;
        font-family: 'Poppins';
        font-size: 11px;
        font-style: normal;
        font-weight: 400;
        line-height: 18px;
        color: rgba(255, 255, 255, 0.6);

        & span {
          font-size: 12px;
          font-weight: 600;
          line-height: 18px;
          color: #ffc550;
          cursor: pointer;
        }
      }

      & .right {
        width: 140px;
        font-family: 'Poppins';
        font-size: 11px;
        font-style: normal;
        font-weight: 400;
        line-height: 18px;
        color: rgba(255, 255, 255, 0.6);
        text-align: right;
      }
    }
  }

  & .row {
    display: flex;
    justify-content: space-between;
    margin-top: 24px;

    & .txt__title {
      font-size: 14px;
      font-weight: 400;
      line-height: 18px;
    }

    & .wrap__ask__price {
      display: flex;
      gap: 16px;
      justify-content: flex-end;

      & .wrap__price__column {
        display: flex;
        flex-direction: column;
        gap: 4px;
        align-items: flex-end;
        text-align: right;

        & .txt__note {
          font-size: 11px;
          font-weight: 400;
          line-height: 18px;
          text-align: right;
          opacity: 0.5;
        }

        & .wrap__input {
          display: flex;
          flex-direction: row;
          gap: 0px;
          align-items: center;
          justify-content: flex-end;
          width: 93px;
          height: 36px;
          padding: 8px 12px;
          background: #212126;
          border: 1px solid rgba(120, 120, 120, 0.2);
          border-radius: 60px;

          & input {
            width: 100%;
            font-family: 'Poppins';
            font-size: 16px;
            font-style: normal;
            font-weight: 600;
            line-height: 20px;
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
          & span {
            margin-left: 2px;
            font-size: 16px;
            font-style: normal;
            font-weight: 400;
            line-height: 20px;
            opacity: 0.5;
          }
        }
      }
    }

    & .wrap__value {
      display: flex;
      flex-direction: column;
      gap: 2px;
      align-items: flex-end;

      & .txt__value {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        font-size: 16px;
        font-weight: 600;
        line-height: 20px;
        text-align: right;
      }

      & .icon__tips::after {
        position: absolute;
        top: -5px;
        right: -12px;
        width: 20px;
        height: 20px;
        margin-right: -5px;
        text-align: center;
        cursor: pointer;
        content: 'i';
        border: 0.5px solid;
        border-radius: 10px;
        opacity: 0.5;
        scale: 0.5;
      }

      & .txt__note {
        font-size: 11px;
        font-weight: 400;
        line-height: 18px;
        text-align: right;
        opacity: 0.5;
      }
    }
  }
}
</style>
