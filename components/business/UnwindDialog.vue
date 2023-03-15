<template>
  <y-dialog v-bind="$attrs" class="y-claim-dob-dialog">
    <div class="dialog__body">
      <div class="row__ row__title">
        <img class="img__sniper" :src="getTokenIcon(icons.sniper)" />
        <div class="txt__title">{{ userSniperData.name }}</div>
      </div>
      <div class="row__ row__amount">
        <div class="wrap__txt__amount">
          <p>Amount</p>
          <p>
            Available to Unwind:
            {{
              useTokenNumberFormat(div18(userSniperData.stakedAmount), {
                token: 'SNIPER',
              })
            }}
          </p>
        </div>
        <div class="wrap__amount__input">
          <div class="wrap__input">
            <input
              v-model="inputUnstakeAmount"
              autocomplete="off"
              pattern="^[0-9]*[.,]?[0-9]*$"
              placeholder="0"
              @input="changeAmount"
            />
          </div>
          <p>{{ inputSniperUSD }}</p>
        </div>
      </div>
      <div class="row__ row__amount__slider">
        <percentage-selector
          v-model:percentProp="slidePercentage"
          :enable="true"
          @percentChange="percentChange"
          @onSelect="handlePercentageChange"
        ></percentage-selector>
      </div>
      <div class="row__ row__date">
        <div class="txt__title">Expiry Date</div>
        <div class="txt__expiry__date">
          {{
            dayjs(Number(userSniperData.exerciseTimestamp) * 1000).format(
              'MMM. D, YYYY'
            )
          }}
          <br />
          <span v-if="exerciseDateNote === 'Expired'" style="color: #de4238">
            {{ exerciseDateNote }}
          </span>
          <span v-if="exerciseDateNote !== 'Expired'">
            {{ exerciseDateNote }}
          </span>
        </div>
      </div>
      <div class="row__">
        <div class="txt__title">Current vAPR</div>
        <div class="txt__bold">{{ userSniperData.aprString }}</div>
      </div>
      <div class="wrap__material">
        <div class="wrap__item">
          <div>Matching BULLET</div>
          <div
            class="wrap__value"
            style="display: flex; flex-direction: column; gap: 2px"
          >
            <div
              style="
                display: flex;
                gap: 4px;
                justify-content: end;
                text-align: right;
              "
            >
              <img
                style="width: 18px; height: 18px"
                :src="getTokenIcon(icons.bullet)"
              />
              <div style="font-size: 16px; font-weight: 600">
                {{
                  useTokenNumberFormat(
                    div18(userSniperData.matchingBulletAmount),
                    { token: 'BULLET' }
                  )
                }}
              </div>
            </div>
            <div style="text-align: right; opacity: 0.5">
              {{
                useUSDFormat(userSniperData.matchingBulletAmountUSD, {
                  showApprox: true,
                })
              }}
            </div>
          </div>
        </div>
        <div class="wrap__item">
          <div>Matching SNIPER</div>
          <div
            class="wrap__value"
            style="display: flex; flex-direction: column; gap: 2px"
          >
            <div
              style="
                display: flex;
                gap: 4px;
                justify-content: end;
                text-align: right;
              "
            >
              <img
                style="width: 18px; height: 18px"
                src="~/assets/img/icon_b_sniper@2x.png"
              />
              <div style="font-size: 16px; font-weight: 600">
                {{
                  useTokenNumberFormat(
                    div18(userSniperData.matchingSniperAmount),
                    { token: 'SNIPER' }
                  )
                }}
              </div>
            </div>
            <div style="text-align: right; opacity: 0.5">
              {{
                useUSDFormat(userSniperData.matchingSniperAmountUSD, {
                  showApprox: true,
                })
              }}
            </div>
          </div>
        </div>
      </div>
      <p class="txt__desc">
        Your Unwind amount is limited by the matching BULLET and SNIPER amount
        combined
      </p>
      <y-btn
        v-loading="unstaking"
        bg
        :disabled="inputUnstakeAmount <= 0"
        height="48"
        style="margin-top: -16px"
        @click="clickUnstake"
      >
        Unstake {{ inputUnstakeAmount }} SNIPER
      </y-btn>
      <p class="txt__desc">
        Adjust the amount of SNIPER in the amount section above
      </p>
      <y-btn bg :disabled="unwindAmount <= 0" height="48" @click="clickUnwind">
        Unwind {{ unwindAmount }} SNIPER
      </y-btn>
      <p class="txt__desc">
        Note: Unwind is a two-step process, that requires SNIPER unstaking
      </p>
    </div>
  </y-dialog>
</template>

<script setup lang="ts">
import { Big } from 'big.js'
import { withdrawTarget } from 'deorderbook-sdk/ethereum/option'
import dayjs from 'dayjs'
import { PropType } from 'vue'
import { Fraction } from '@uniswap/sdk'
import { unstake } from 'deorderbook-sdk/ethereum/staking_pool'
import { numberFormat, div18, YMessage } from '~/utils'
import PercentageSelector from '~/components/business/PercentageSelector.vue'
import { useTokensStore } from '~/store/tokens'
import { formatTimestamp } from '~/utils/timestamp'
import { FormattedOptionAccount } from '~/types/options'
import { useWaitTx } from '~/composables/useWaitTx'

const loading = useLoading()
const props = defineProps({
  sniperData: {
    type: Object as PropType<FormattedOptionAccount>,
    default: {} as FormattedOptionAccount,
  },
})
const { getFormattedOptionAccountBy } = toRefs(useOptionAccountsStore())

const { formattedUserSnipers, actionRefreshOptionAccounts } = toRefs(
  useOptionAccountsStore()
)
const userSniperData = ref<FormattedOptionAccount>(props.sniperData!)

watch(formattedUserSnipers, () => {
  formattedUserSnipers.value.forEach((one) => {
    if (one.id === userSniperData.value.id) {
      userSniperData.value = one
    }
  })
})

const inputUnstakeAmount = ref('0')
const changeAmount = (value: { target: { value: any } }) => {
  const val = Number(value.target.value) ?? 0
  let percentage = Big(val)
    .mul(1e20)
    .div(
      Big(
        userSniperData.value.stakedAmount === '0'
          ? 1
          : userSniperData.value.stakedAmount
      )
    )
    .toNumber()
  if (percentage > 100) {
    percentage = 100
  }
  slidePercentage.value = percentage
}

const resetInput = () => {
  inputUnstakeAmount.value = '0'
  slidePercentage.value = 0
}

const slidePercentage = ref(0)
const percentChange = (value: number) => {
  handlePercentageChange(value)
}
const handlePercentageChange = (percent: number) => {
  inputUnstakeAmount.value = new Fraction(
    Big(userSniperData.value.stakedAmount).mul(percent).toString(),
    BigInt(1e20)
  ).toSignificant(12)
}

const icons = computed(() => {
  if (userSniperData.value.type === 'uSNIPER') {
    return {
      sniper: 'uSNIPER',
      bullet: 'uBULLET',
    }
  } else {
    return {
      sniper: 'bSNIPER',
      bullet: 'bBULLET',
    }
  }
})

const { tokenWBTC } = toRefs(useTokensStore())

/**
 * For uSniper:
 * WBTC Price > Strike Price, uSniperPrice = 1; WBTC Price <= Strike Price, uSniperPrice = WBTC Price / Strike Price
 * For bSniper:
 * WBTC Price > Strike Price, bSniperPrice = Strike Price; WBTC Price <= Strike Price, uSniperPrice = WBTC Price
 */
const sniperPrice = computed(() => {
  const strikePrice = div18(userSniperData.value.strikePrice)
  if (userSniperData.value.type === 'uSNIPER') {
    if (tokenWBTC.value.priceUSD > strikePrice) {
      return 1
    } else {
      return Big(tokenWBTC.value.priceUSD).div(strikePrice).toFixed()
    }
  }
  if (tokenWBTC.value.priceUSD > strikePrice) {
    return strikePrice
  } else {
    return tokenWBTC.value.priceUSD
  }
})
const inputSniperUSD = computed(() => {
  const inputAmount =
    inputUnstakeAmount.value === '' ? '0' : inputUnstakeAmount.value
  return `${useUSDFormat(Big(sniperPrice.value).mul(inputAmount ?? 0), {
    showApprox: true,
  })}`
})

const { getTokenIcon } = useTokens()

const exerciseDateNote = computed(() => {
  return formatTimestamp(userSniperData.value.exerciseTimestamp)
})

const unstaking = ref(false)
const clickUnstake = () => {
  if (Big(inputUnstakeAmount.value).lte(Big(0))) {
    YMessage.error('Invalid input')
    return
  }
  const amount = new Big(10)
    .pow(18)
    .times(inputUnstakeAmount.value ?? 0)
    .toFixed()
  unstaking.value = true
  unstake(userSniperData.value.id, amount)
    .then(async (resp) => {
      const { waitTx } = useWaitTx(resp)
      await waitTx()
        .then((bool) => {
          if (bool) {
            actionRefreshOptionAccounts.value()
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
        .finally(() => {
          unstaking.value = false
        })
    })
    .catch((err) => {
      unstaking.value = false
      if (err.code !== 4001) {
        YMessage.error(err.message)
      }
    })
}

const clickUnwind = () => {
  const matchingBullet = parseFloat(
    div18(userSniperData.value.matchingBulletAmount)
  )
  const matchingSniper = parseFloat(
    div18(userSniperData.value.matchingSniperAmount)
  )
  const amount = Big(1e18).times(Math.min(matchingBullet, matchingSniper))
  if (amount.lte(0)) {
    YMessage.error('unwind amount less then 0')
    return
  }
  loading.show()
  withdrawTarget(userSniperData.value.address, amount.toFixed())
    .then((resp) => {
      const { waitTx } = useWaitTx(resp)
      waitTx()
        .then((bool) => {
          YMessage.success('Action Succeed')
          actionRefreshOptionAccounts.value()
          loading.hide()
        })
        .catch((err) => {
          YMessage.error(err.message)
          loading.hide()
        })
    })
    .catch((err) => {
      YMessage.error(err.message)
      loading.hide()
    })
}

const unwindAmount = computed(() => {
  const matchingBullet = parseFloat(
    div18(userSniperData.value.matchingBulletAmount ?? 0)
  )
  const matchingSniper = parseFloat(
    div18(userSniperData.value.matchingSniperAmount ?? 0)
  )
  const minAmount = Math.min(matchingSniper, matchingBullet)
  return useTokenNumberFormat(minAmount, {
    token: minAmount === matchingSniper ? 'SNIPER' : 'BULLET',
  })
})
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<style lang="postcss" scoped>
.y-claim-dob-dialog {
  & .dialog__body {
    display: flex;
    flex-direction: column;
    gap: 24px;
    font-family: 'Poppins';
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 18px;

    & .row__ {
      display: flex;
      justify-content: space-between;

      & .txt__bold {
        font-size: 16px;
        font-weight: 600;
      }
    }

    & .row__title {
      display: flex;
      gap: 8px;
      align-items: center;
      justify-content: flex-start;

      & .img__sniper {
        width: 36px;
        height: 36px;
      }

      & .txt__title {
        font-family: 'Poppins';
        font-size: 16px;
        font-style: normal;
        font-weight: 600;
        line-height: 24px;
      }
    }

    & .row__amount {
      display: flex;
      justify-content: space-between;

      & .wrap__txt__amount {
        display: flex;
        flex-direction: column;

        & p:first-child {
          font-family: 'Poppins';
          font-size: 14px;
          font-style: normal;
          font-weight: 400;
          line-height: 18px;
        }
        & p:last-child {
          font-size: 11px;
          opacity: 0.5;
        }
      }

      & .wrap__amount__input {
        display: flex;
        flex-direction: column;
        gap: 2px;

        & .wrap__input {
          width: 100px;
          height: 44px;
          padding: 12px 16px;
          background: #212126;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 53px;
          box-shadow: inset 0px 0px 6px #141414;

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
          }
        }

        & p {
          font-family: 'Poppins';
          font-size: 11px;
          font-style: normal;
          font-weight: 400;
          line-height: 18px;
          color: #ffffff;
          text-align: right;
          opacity: 0.5;
        }
      }
    }

    & .row__date {
      & .txt__expiry__date {
        font-family: 'Poppins';
        font-size: 16px;
        font-style: normal;
        font-weight: 600;
        line-height: 20px;
        text-align: right;

        & span {
          font-size: 11px;
          font-weight: 400;
          line-height: 18px;
          color: #ffffff;
          opacity: 0.5;
        }
      }
    }

    & .wrap__material {
      display: flex;
      flex-direction: column;
      gap: 18px;
      padding: 16px;
      background: #212126;
      border: 1px solid #4d4d4d;
      border-radius: 16px;

      & .wrap__item {
        display: flex;
        justify-content: space-between;

        & .wrap__value {
        }
      }
    }

    & :deep(.txt__desc) {
      margin-top: -20px;
      font-size: 11px;
      text-align: center;
      word-break: break-word;
      opacity: 0.5;
    }
  }
}
</style>
