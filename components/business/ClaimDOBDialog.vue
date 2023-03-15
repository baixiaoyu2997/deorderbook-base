<template>
  <y-dialog
    ref="elRef"
    v-loading="loading"
    class="y-claim-dob-dialog"
    v-bind="{ ...$attrs, ...props }"
    title="All DOB Rewards"
    width="540px"
    center
  >
    <div class="dialog__body">
      <div class="wrap__table">
        <div v-for="(item, index) in tableData" :key="index" class="wrap__item">
          <div class="wrap__name">
            <img v-if="item.icon !== ''" :src="item.icon" />
            {{ item.name }}
          </div>
          <div class="wrap__value">
            {{ item.value }}
            <br />
            <span>{{ item.valueNote }}</span>
          </div>
          <y-btn
            v-if="item.showClaim"
            class="btn__claim"
            bg
            blue
            height="36px"
            @click="clickClaimSingle(item)"
          >
            Claim
          </y-btn>
        </div>
      </div>
      <div class="wrap__table">
        <div class="wrap__item">
          <div class="wrap__name">Total</div>
          <div class="wrap__value">
            {{ useTokenNumberFormat(div18(allRewardAmount), { token: 'DOB' }) }}
            DOB
            <br />
            <span>
              {{
                useUSDFormat(
                  div18(Big(tokenDOB.priceUSD).mul(allRewardAmount)),
                  { showApprox: true }
                )
              }}
            </span>
          </div>
        </div>
      </div>
      <y-btn
        v-if="Big(sniperRewardAmount).gt(0)"
        blue
        bg
        height="50px"
        @click="clickClaimDOBFromSniperPools"
      >
        Claim All
        {{ useTokenNumberFormat(div18(sniperRewardAmount), { token: 'DOB' }) }}
        DOB Rewards From SNIPER Pools
      </y-btn>
      <y-btn
        v-if="Big(hodlRewardAmount).gt(0)"
        blue
        bg
        height="50px"
        @click="clickClaimDOBFromHodlPools"
      >
        Claim All
        {{ useTokenNumberFormat(div18(hodlRewardAmount), { token: 'DOB' }) }}
        DOB Rewards from HODL Pools
      </y-btn>
    </div>
  </y-dialog>
</template>

<script setup lang="ts">
import Big from 'big.js'
import { BaseTokenSymbol } from 'deorderbook-sdk/ethereum/token_provider'
import {
  getRewardFromHodlPools,
  redeemRewards as redeemFromHODLPool,
} from 'deorderbook-sdk/ethereum/hodl_pool'
import {
  getRewardFromSniperPools,
  redeemRewards as redeemFromSniperPool,
} from 'deorderbook-sdk/ethereum/staking_pool'
import { useDOBStore, useDOBRewardStore } from '~/store/dob'
import { div18, YMessage } from '~/utils'
import { useWaitTx } from '~/composables/useWaitTx'
import { useWallet } from '~/composables/useWallet'
import useTokens from '~/composables/useTokens'
import { TokenSymbols } from '~/composables/useTokens'
import { useTokensStore } from '~/store/tokens'

const props = defineProps({
  appendToBody: {
    type: Boolean,
    default: true,
  },
})

const { getTokenIcon } = useTokens()
const loading = useLoading()
const {
  rewardItems,
  allRewardAmount,
  hodlRewardAmount,
  sniperRewardAmount,
  actionRefreshItems,
} = toRefs(useDOBRewardStore())
const { actionRefreshDOBContractInfo, actionRefreshUserDOBInfo } = toRefs(
  useDOBStore()
)

const { address } = useWallet()

watch(address, () => {
  if (address.value !== '') {
    actionRefreshItems.value()
  }
})

interface item {
  id: string
  type: string
  icon: string
  name: string
  value: string
  valueNote: string
  showClaim: boolean
}

const { tokenDOB } = toRefs(useTokensStore())

const tableData = computed(() => {
  const dobPrice = tokenDOB.value.priceUSD
  const out = rewardItems.value
    .filter((one) => {
      return Number(one.rewardAmount)
    })
    .map((one) => {
      const formatted: item = {
        id: one.id,
        type: one.from,
        icon: '',
        name: one.name,
        value: `${useTokenNumberFormat(div18(one.rewardAmount), {
          token: 'DOB',
        })} DOB`,
        valueNote: `${useUSDFormat(div18(Big(dobPrice).mul(one.rewardAmount)), {
          showApprox: true,
        })}`,
        showClaim: true,
      }
      formatted.icon = getTokenIcon(one.from as TokenSymbols)
      return formatted
    })
  return out
})

const clickClaimSingle = (item: item) => {
  if (
    item.type === BaseTokenSymbol.USNIPER ||
    item.type === BaseTokenSymbol.BSNIPER
  ) {
    loading.show()
    redeemFromSniperPool(item.id)
      .then(async (resp) => {
        const { waitTx } = useWaitTx(resp)
        await waitTx()
          .then((result) => {
            if (result) {
              YMessage.success('Action Succeeded')
              actionRefreshItems.value()
            }
          })
          .finally(() => {
            loading.hide()
          })
      })
      .catch(() => {
        loading.hide()
      })
      .finally(() => {})
  } else if (
    item.type === BaseTokenSymbol.UHODL ||
    item.type === BaseTokenSymbol.BHODL
  ) {
    loading.show()
    redeemFromHODLPool(item.id)
      .then((resp) => {
        const { waitTx } = useWaitTx(resp)
        waitTx()
          .then((result) => {
            if (result) {
              YMessage.success('Action Succeeded')
            }
          })
          .finally(() => {
            loading.hide()
          })
      })
      .catch(() => {
        loading.hide()
      })
  }
}

const clickClaimDOBFromSniperPools = () => {
  const poolIds = rewardItems.value
    .filter((one) => {
      return (
        (one.from === BaseTokenSymbol.USNIPER ||
          one.from === BaseTokenSymbol.BSNIPER) &&
        Big(one.rewardAmount).gt(0)
      )
    })
    .map((one) => {
      return one.id
    })
  loading.show()
  getRewardFromSniperPools(poolIds)
    .then(async (resp) => {
      const { waitTx } = useWaitTx(resp)
      await waitTx()
        .then((result) => {
          if (result) {
            YMessage.success('Action Succeeded')
            actionRefreshDOBContractInfo.value()
            actionRefreshUserDOBInfo.value()
            actionRefreshItems.value()
          }
        })
        .finally(() => {
          loading.hide()
        })
    })
    .catch(() => {
      loading.hide()
    })
}

const clickClaimDOBFromHodlPools = () => {
  const poolIds = rewardItems.value
    .filter((one) => {
      return (
        (one.from === BaseTokenSymbol.UHODL ||
          one.from === BaseTokenSymbol.BHODL) &&
        Big(one.rewardAmount).gt(0)
      )
    })
    .map((one) => {
      return one.id
    })
  loading.show()
  getRewardFromHodlPools(poolIds)
    .then(async (resp) => {
      const { waitTx } = useWaitTx(resp)
      await waitTx()
        .then((result) => {
          if (result) {
            YMessage.success('Action Succeeded')
            actionRefreshDOBContractInfo.value()
            actionRefreshUserDOBInfo.value()
            actionRefreshItems.value()
          }
        })
        .finally(() => {
          loading.hide()
        })
    })
    .catch(() => {
      loading.hide()
    })
}
</script>

<style lang="postcss" scoped>
.y-claim-dob-dialog {
  & .dialog__body {
    display: flex;
    flex-direction: column;
    gap: 16px;

    & .wrap__table {
      max-height: 402px;
      margin-bottom: 8px;
      overflow: auto;

      & .wrap__item {
        display: flex;
        gap: 8px;
        align-items: center;
        justify-content: flex-start;

        min-height: 74px;
        padding: 0 24px;
        background: #212126;
        border: 1px solid rgba(120, 120, 120, 0.2);
        border-radius: 24px;
        box-shadow: inset 0px 0px 6px #141414;

        & .wrap__name {
          display: flex;
          width: 200px;
          font-family: 'Poppins';
          font-size: 16px;
          font-style: normal;
          font-weight: 600;
          line-height: 24px;
          color: #ffffff;

          & img {
            width: 24px;
            height: 24px;
            margin: auto 8px auto 0;
          }
        }

        & .wrap__value {
          width: 130px;
          font-family: 'Poppins';
          font-size: 16px;
          font-style: normal;
          font-weight: 600;
          line-height: 20px;
          color: #ffffff;
          text-align: center;

          & span {
            font-size: 11px;
            font-weight: 400;
            line-height: 18px;
            opacity: 0.6;
          }
        }

        & .btn__claim {
          width: 100px;
        }
      }
    }
  }
}
</style>
