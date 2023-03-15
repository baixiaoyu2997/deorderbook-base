<template>
  <div class="tx-page content--max">
    <y-search-hash v-model="hashValue" class="home__search"></y-search-hash>
    <div class="title__hash">
      <div class="hash__label">Transaction hash:</div>
      <y-address-copy
        :address="params.hash"
        :icon-size="16"
        ellipsis
        class="hash__copy"
      ></y-address-copy>
    </div>
    <div v-loading.body="isLoading" class="page__detail--wrap">
      <div v-if="txDetail" class="page__detail">
        <template v-for="item in txDetailRows">
          <div v-if="item.show" :key="item.label" class="detail__row">
            <div class="row__label--wrap">
              <y-tooltip-icon
                :icon-size="16"
                icon-color="rgba(255, 255, 255, 0.3)"
                :content="item.tooltip"
              >
                <template #before>{{ item.label }}</template>
              </y-tooltip-icon>
            </div>
            <div class="row__value--wrap">
              <template v-if="item.label === 'Transaction Type'">
                <div class="value--transaction-type">
                  <div>{{ item.value }}</div>
                  <div
                    v-if="item.subTitle"
                    class="type__sub-title"
                    :class="{
                      'is-sell': item.subTitle === 'Sell',
                      'is-buy': item.subTitle === 'Buy',
                    }"
                  >
                    {{ item.subTitle }}
                  </div>
                </div>
              </template>
              <y-address-copy
                v-else-if="item.label === 'Transaction Hash'"
                :address="item.value"
                :opacity="0.6"
                text-size="small"
                :icon-size="24"
              ></y-address-copy>
              <template v-else-if="item.label === 'Transaction Status'">
                <div class="value--transaction-status">
                  <div class="status__point"></div>
                  <div>{{ item.value }}</div>
                </div>
              </template>
              <div
                v-else-if="item.label === 'Date & Time'"
                class="value--transaction-date-time"
              >
                {{
                  item.value
                    ? dayjs
                        .utc(new Date(item.value * 1000))
                        .format('MMM-DD-YYYY HH:mm:ss A +UTC')
                    : '-'
                }}
              </div>
              <y-address-copy
                v-else-if="item.label === 'From'"
                :address="txDetail?.account"
                text-size="small"
                :icon-size="24"
                ens
              ></y-address-copy>
              <div
                v-else-if="item.label === 'Contract'"
                class="value--transaction-contract"
              >
                <div class="contract__name">
                  {{ formatContractName }}
                </div>
                <y-address-copy
                  :address="item.value"
                  :opacity="0.6"
                  text-size="small"
                  :icon-size="24"
                ></y-address-copy>
              </div>
              <y-address-copy
                v-else-if="item.label === 'Buyer'"
                :address="txDetail?.account"
                text-size="small"
                :icon-size="24"
                ens
              ></y-address-copy>
              <div
                v-else-if="item.label === 'DeOrdered' && item.show"
                class="value--transaction-deorder"
              >
                <TokenBlock
                  :token="txDetail.underToken!"
                  :amount="txDetail.underTokenAmount!"
                  :usd="txDetail.underTokenUSD!"
                ></TokenBlock>
              </div>
              <div
                v-else-if="
                  item.label === 'Expiry Date' &&
                  ['DeOrderSell', 'DeOrderBuy', 'Exercise'].includes(
                    txDetail.action
                  )
                "
                class="value--transaction-expiry"
              >
                <div v-if="txDetail.exerciseTimestamp">
                  {{
                    dayjs(Number(txDetail.exerciseTimestamp!) * 1000).format(
                      'MMM DD, YYYY'
                    )
                  }}
                </div>
                <div class="row__subtext">
                  {{
                    dayjs(Number(txDetail.exerciseTimestamp!) * 1000).format(
                      'H:mm a'
                    )
                  }}
                </div>
              </div>
              <div
                v-else-if="item.label === 'Strike' && item.show"
                class="value--transaction-strike"
              >
                <template v-if="txDetail.strikePrice">
                  ${{ numberFormat(div18(txDetail.strikePrice)) }}
                </template>
              </div>
              <div
                v-else-if="item.label === 'Amount & Value'"
                class="value--transaction-amount"
              >
                <TokenFlow
                  v-if="item.outTokens!.length > 0"
                  :tokens="item.outTokens!"
                  title="Amount OUT"
                  :usd-prefix="
                    txDetail.action === 'SellBULLET' ? '≈ OTC $' : undefined
                  "
                ></TokenFlow>
                <SVGArrowUp
                  v-if="item.outTokens!.length > 0 && item.inTokens!.length > 0"
                  width="24"
                  height="24"
                  style="margin: 0 8px; opacity: 0.3; transform: rotate(90deg)"
                ></SVGArrowUp>
                <template v-if="item.inTokens!.length > 0">
                  <TokenBulletClaimFlow
                    v-if="txDetail.action === 'BULLETClaim'"
                    :tokens="item.inTokens!"
                    title="Amount IN"
                  ></TokenBulletClaimFlow>
                  <TokenFlow
                    v-else
                    :tokens="item.inTokens!"
                    title="Amount IN"
                  ></TokenFlow>
                </template>
              </div>
              <div
                v-else-if="item.label === 'Selling Price' && item.show"
                class="value--transaction-selling-price"
              >
                <img
                  v-if="txDetail.bulletOTCBuyToken"
                  :src="getTokenIcon(txDetail.bulletOTCBuyToken)"
                  alt=""
                />
                <div>
                  {{
                    useTokenNumberFormat(
                      div18(txDetail.bulletOTCPrice || '0'),
                      {
                        token: txDetail.bulletOTCBuyToken!,
                      }
                    ) +
                    ' ' +
                    txDetail.bulletOTCBuyToken
                  }}
                </div>
                <div style="margin: 0 8px; font-size: 12px; opacity: 0.8">
                  for
                </div>
                <img
                  v-if="item.bulletToken"
                  :src="getTokenIcon(item.bulletToken)"
                  alt=""
                />
                <div>
                  <!-- NOTE: one bullet price -->
                  {{
                    useTokenNumberFormat('1', {
                      token: item.bulletToken!,
                    }) +
                    ' ' +
                    item.bulletToken
                  }}
                </div>
              </div>
              <div
                v-else-if="item.label === 'Expiry Date' && item.show"
                class="value--transaction-expiry"
              >
                <div v-if="item.value">
                  {{ dayjs(Number(item.value)).format('MMM DD, YYYY') }}
                </div>
                <div class="row__subtext">
                  {{ dayjs(Number(item.value)).format('H:mm a') }}
                </div>
              </div>
              <div
                v-else-if="item.label === 'Locked Time' && item.show"
                class="value--transaction-locked"
              >
                <div class="locked__row1">
                  <div class="row1__block">
                    <div class="block__label">From</div>
                    <div class="block__value">
                      <div>
                        {{
                          dayjs(Number(txDetail.timestamp) * 1000).format(
                            'MMM D,YYYY'
                          )
                        }}
                      </div>
                      <div class="row__subtext">
                        {{
                          dayjs(Number(txDetail.timestamp) * 1000).format(
                            'H:mm a'
                          )
                        }}
                      </div>
                    </div>
                  </div>
                  <div class="row1__block">
                    <div class="block__label">Until</div>
                    <div class="block__value">
                      <div>
                        {{
                          dayjs(Number(txDetail.lockUntil) * 1000).format(
                            'MMM D,YYYY'
                          )
                        }}
                      </div>
                      <div class="row__subtext">
                        {{
                          dayjs(Number(txDetail.lockUntil) * 1000).format(
                            'H:mm a'
                          )
                        }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="locked__row2">
                  <SVGLock color="#FFC550" class="chart__lock--start"></SVGLock>
                  <el-progress
                    :stroke-width="13.03"
                    :percentage="item.progress"
                    :show-text="false"
                    class="locked__progress"
                  />
                  <SVGLockOpen class="chart__unlock"></SVGLockOpen>
                </div>
              </div>
              <div
                v-else-if="item.label === 'Amount under Lock' && item.show"
                class="value--transaction-lock-amount"
              >
                <TokenBlock
                  :token="txDetail.outToken!"
                  :amount="item.value"
                  :usd="item.usd!"
                ></TokenBlock>
              </div>
              <div
                v-else-if="item.label === 'Pool' && item.show"
                class="value--transaction-pool"
                :class="
                  txDetail.action === 'DeOrderSell' ? 'is-sell' : 'is-buy'
                "
              >
                {{ txDetail.pool }}
              </div>
              <div
                v-else-if="item.label === 'vAPR' && item.show"
                class="value--transaction-apr"
              >
                {{ txDetail.apy }}
              </div>
              <div
                v-else-if="item.label === 'Filled' && item.show"
                class="value--transaction-filled"
              >
                <TokenBlock
                  :token="txDetail.underToken!"
                  :amount="filledInfo.amount"
                  :usd="item.usd!"
                ></TokenBlock>
                <div class="filled__progress--wrap">
                  <el-progress
                    :stroke-width="13.03"
                    text-inside
                    :percentage="filledInfo.percent"
                    :show-text="false"
                    class="filled__progress"
                  />
                  <div class="progress__text">{{ filledInfo.percent }}%</div>
                </div>
              </div>
              <div v-else-if="item.label === 'Fee'">
                <img
                  v-if="txDetail.fees === null"
                  src="~/assets/img/free@m2x.webp"
                  style="width: 26.94px; height: 26.94px"
                />
                <template v-else>
                  <TokenBlock
                    v-if="txDetail.fees !== null"
                    :token="txDetail.feeToken!"
                    :amount="txDetail.fees"
                    :usd="txDetail.feesUSD!"
                  ></TokenBlock>
                  <TokenBlock
                    v-if="txDetail.fees2 !== null"
                    :token="txDetail.fee2Token!"
                    :amount="txDetail.fees2"
                    :usd="txDetail.fees2USD!"
                    style="margin-top: 16px"
                  ></TokenBlock>
                </template>
              </div>
              <template v-else>{{ item.value }}</template>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<!-- eslint-disable max-lines -->
<!-- eslint-disable max-lines-per-function -->
<script setup lang="ts">
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { stakingInfo } from 'deorderbook-sdk/ethereum/dob_staking_pool'
import { Big } from 'big.js'
import { getSniperPoolList } from 'deorderbook-sdk'
import TokenFlow from './items/TokenFlow.vue'
import TokenBulletClaimFlow from './items/TokenBulletClaimFlow.vue'
import TokenBlock from './items/TokenBlock.vue'
import SVGArrowUp from '~icons/lucide/arrow-up'
import SVGLock from '~icons/heroicons-outline/lock-closed'
import SVGLockOpen from '~icons/heroicons-outline/lock-open'
dayjs.extend(utc)

// [ Init ]
const { params } = useRoute()
const { currentRoute } = useRouter()
const hashValue = ref('')
const { getTokenIcon, getTokenPrice } = useTokens()

// [ Detail ]
const { trades, isLoading } = useTrades({
  where: {
    txHash: params.hash as string,
  },
})

const txDetail = computed(() => {
  const trade =
    currentRoute.value.query.action === 'BuyBULLET'
      ? trades.value[1]
      : trades.value[0]
  return trade
})

const userStakingInfo = computedAsync(() => {
  if (txDetail.value.action === 'Lock') {
    return stakingInfo(txDetail.value.account)
  }
})

const txDetailRows = computed(() => {
  const filledShow =
    ['DeOrderBuy', 'DeOrderSell'].includes(txDetail.value.action) &&
    Number(txDetail.value.inTokens[0]?.exerciseTimestamp + '000') +
      24 * 60 * 60 * 1000 <=
      Date.now()

  const rows = [
    {
      label: 'Transaction Type',
      tooltip: 'The type of transaction processed.',
      value: setTxType(),
      subTitle: setTxTypeSubTitle(),
      show: true,
    },
    {
      label: 'Transaction Hash',
      tooltip:
        'The unique blockchain-generated identifier for this transaction.',
      value: params.hash,
      show: true,
    },
    {
      label: 'Transaction Status',
      tooltip: 'The current state of the transaction on the blockchain.',
      value: 'Success',
      show: true,
    },
    {
      label: 'Date & Time',
      tooltip: 'The date and time at which the transaction was initiated.',
      value: txDetail.value?.timestamp,
      show: true,
    },
    {
      label: 'From',
      tooltip: 'The user address for this transaction.',
      show: true,
    },
    {
      label: 'Contract',
      tooltip:
        'The smart contract that the user interacted with in the transaction.',
      value: txDetail.value?.contractAddress,
      show: true,
    },
    {
      label: 'Buyer',
      tooltip: 'The buyer address for this transaction.', // TODO: 产品一直没有提供，所以自己添加的
      show: ['BuyBULLET', 'Exercise', 'BULLETClaim', 'SoldBULLET'].includes(
        txDetail.value?.action
      ),
    },
    {
      label: 'DeOrdered',
      tooltip: 'The value of the DeOrder transaction.',
      show: txDetail.value.action.startsWith('DeOrder'),
    },
    {
      label: 'Expiry Date',
      tooltip: 'The date and time at which the order will expire.',
      show: ['DeOrderSell', 'DeOrderBuy', 'Exercise'].includes(
        txDetail.value.action
      ),
    },
    {
      label: 'Strike',
      tooltip: 'The strike price selected by the user.',
      show: txDetail.value.action.startsWith('DeOrder'),
    },
    {
      label: 'Amount & Value',
      tooltip:
        'The token amount involved in this transaction and its current market value.',
      inTokens: txDetail.value?.inTokens,
      outTokens: rowOutToken.value,
      show: true,
    },
    {
      label: 'Selling Price',
      tooltip: 'This is the price paid out for the sold assets.',
      show: ['SellBULLET', 'BuyBULLET', 'SoldBULLET'].includes(
        txDetail.value.action
      ),
      amount:
        txDetail.value.action === 'SoldBULLET'
          ? txDetail.value.inTokens[0].amount
          : txDetail.value.outTokenAmount,
      bulletToken: (txDetail.value.optionType === '0'
        ? 'bBULLET'
        : 'uBULLET') as 'bBULLET' | 'uBULLET',
    },
    {
      label: 'Expiry Date',
      tooltip: 'The date and time at which the order will expire.',
      show: ['SellBULLET', 'BuyBULLET', 'SoldBULLET'].includes(
        txDetail.value.action
      ),
      value:
        Number(
          txDetail.value.action === 'SoldBULLET'
            ? txDetail.value.inTokens[0].exerciseTimestamp
            : txDetail.value.exerciseTimestamp
        ) * 1000,
    },
    {
      label: 'Locked Time',
      tooltip: 'The time at which the user locked $DOB.',
      progress: setRowProgress(),
      show: txDetail.value.action === 'Lock',
    },
    {
      label: 'Amount under Lock',
      tooltip: 'The amount of $DOB placed under Lock.',
      value: userStakingInfo.value?.currentStakingAmount,
      usd: Big(getTokenPrice('DOB').value || '0')
        .times(userStakingInfo.value?.currentStakingAmount.toString() || '0')
        .div(10 ** 18)
        .toString(),
      show: txDetail.value.action === 'Lock',
    },
    {
      label: 'Pool',
      tooltip:
        'The name of the pool selected, based on the timing and value considered in your DeOrder.',
      show: txDetail.value.action.startsWith('DeOrder'),
    },
    {
      label: 'vAPR',
      tooltip:
        'Variable Annual Percentage Rate, calculated as : (dollar-value of DOB rewards) / (dollar-value staked in pool)',
      show: [
        'Mint',
        'SellBULLET',
        'BuyBULLET',
        'SoldBULLET',
        'Exercise',
        'BULLETClaim',
      ].every((x) => txDetail.value.action !== x),
    },
    // NOTE: only show when after Exercise Day is over
    {
      label: 'Filled',
      tooltip: 'The amount filled in this order.',
      usd: filledShow
        ? Big(getTokenPrice(txDetail.value.underToken!).value)
            .times(div18(filledInfo.amount))
            .toString()
        : '0',
      show: filledShow,
    },
    {
      label: 'Fee',
      tooltip:
        'The amount of fees that have been collected for this transaction.',
      show: true,
    },
    // TODO: wait for backend add, ['DeorderSell','DeorderBuy','Lock'] actions need this
    // {
    //   label: 'Rewards Earned',
    //   tooltip: 'The amount of rewards earned once the transaction has succeeded.',
    //   value: txDetail.value?.fees,
    //   show: txDetail.value.action.startsWith('DeOrder'),
    // },
  ]
  return rows
})

console.log(txDetail)
const setTxType = () => {
  const txTypeEnum = {
    Unwind: 'Unwind',
    DeOrderSell: 'DeOrder',
    DeOrderBuy: 'DeOrder',
    Mint: 'Mint',
    Lock: 'Lock',
    Claim: 'Claim',
    DOBClaim: 'Claim',
    Withdraw: 'Withdraw',
    Unstake: 'Unstake',
    Stake: 'Stake',
    Collect: 'Collect',
    SellBULLET: 'BULLET Listing',
    BuyBULLET: 'BULLET Buy',
    SoldBULLET: 'BULLET Sell',
    Exercise: 'Exercise',
    BULLETClaim: 'Claim',
  }
  return txTypeEnum[txDetail.value.action]
}
const setTxTypeSubTitle = () => {
  if (['DeOrderSell', 'DeOrderBuy'].includes(txDetail.value.action)) {
    return txDetail.value.action.substring(7)
  }
}
const setRowProgress = () => {
  if (txDetail.value.action === 'Lock') {
    const total =
      Number(txDetail.value.lockUntil) - Number(txDetail.value.timestamp)
    const current = Date.now() / 1000 - Number(txDetail.value.timestamp)
    return (current / total) * 100
  }
}

const rowOutToken = computed(() => {
  const outTokens = []
  if (txDetail.value?.outToken) {
    outTokens.push({
      token: txDetail.value?.outToken,
      amount: txDetail.value?.outTokenAmount,
      // NOTE: 只有SellBULLET显示OTC价值
      usd: ['SellBULLET'].includes(txDetail.value.action)
        ? txDetail.value.bulletOTCUSD
        : txDetail.value?.outTokenUSD,
    })
  }
  if (txDetail.value?.outToken2) {
    outTokens.push({
      token: txDetail.value?.outToken2,
      amount: txDetail.value?.outToken2Amount,
      usd: txDetail.value?.outToken2USD,
    })
  }
  return outTokens
})

// [ Contract ]
const formatContractName = computed(() => {
  // if (['Unwind', 'Exercise'].includes(txDetail.value.action)) {
  //   const params = {
  //     optionType: txDetail.value.optionType!,
  //     exerciseTimestamp: txDetail.value.exerciseTimestamp!,
  //     strikePrice: txDetail.value.strikePrice!,
  //   }
  //   return 'SNIPER pool ' + useSniperNickname(params)
  // } else
  if (
    ['Claim', 'Unstake', 'Stake', 'Collect', 'Unwind', 'Exercise'].includes(
      txDetail.value.action
    )
  ) {
    return 'StakingPools'
  } else if (
    ['Lock', 'DOBClaim', 'Withdraw', 'BULLETClaim'].includes(
      txDetail.value.action
    )
  ) {
    return 'DOBStakingPool'
  } else if (['Mint', 'Redeem'].includes(txDetail.value.action)) {
    return 'HODLToken'
  } else {
    return txDetail.value.contract
  }
})

// [ Filled ]
const filledInfo = reactive({
  percent: 0,
  amount: '0',
  usd: '0',
})
watch(
  () => txDetail.value?.action,
  () => {
    if (
      ['DeOrderSell', 'DeOrderBuy'].includes(txDetail.value.action) &&
      txDetail.value.inTokens[0].address
    ) {
      return getSniperPoolList({
        where: { token: txDetail.value.inTokens[0].address },
      }).then((res) => {
        filledInfo.amount = res[0].exerciseAmount
        filledInfo.percent = Big(res[0].exerciseAmount)
          .div(res[0].totalAmount)
          .times(100)
          .round(2)
          .toNumber()
      })
    }
  }
)
</script>
<!-- eslint-disable max-lines -->
<style lang="postcss" scoped>
.tx-page {
  padding: 86.98px 0;
  & .home__search {
    margin: 0 auto;
  }
  & .title__hash {
    display: flex;
    margin-top: 40px;
    & .hash__label {
      font-size: 20px;
      font-weight: 600;
      line-height: 30px;
    }
    & .hash__copy {
      margin-left: 4px;
    }
  }
  & .page__detail--wrap {
    min-height: 500px;
    padding: 32px;
    margin-top: 40px;
    background: radial-gradient(
      49.67% 49.67% at 88.76% 5.88%,
      #323232 0%,
      #26262b 95.31%
    );

    border: 0.5px solid #4c4c4c;
    border-radius: 16px;
    box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.59);
  }
  & .page__detail {
    padding: 16px;
    background: #212126;
    border: 1px solid #4d4d4d;
    border-radius: 16px;
    & .detail__row {
      display: flex;
      align-items: center;
      &:not(:first-child) {
        margin-top: 32px;
      }
      & .row__label--wrap {
        width: 433px;
        font-size: 14px;
        line-height: 18px;
      }
      & .row__value--wrap {
        flex: 1;
        font-size: 14px;
        font-weight: 600;
        line-height: 18px;
        & .value--transaction-type {
          display: flex;
          align-items: center;
          font-size: 16px;
          font-weight: 600;
          line-height: 20px;
          & .type__sub-title {
            padding: 1px 8px;
            margin-left: 8px;
            font-size: 10px;
            font-weight: 600;
            line-height: 15px;
            text-align: center;
            border-radius: 43px;
            &.is-sell {
              color: #f65046;
              background: linear-gradient(
                0deg,
                #c61d10 -6.13%,
                #7f1d17 23.93%,
                #510906 49.55%
              );
              border: 0.5px solid #ba2d24;
            }
            &.is-buy {
              color: #32b845;
              background: linear-gradient(
                0deg,
                #13651f 0%,
                #07310d 60.94%,
                #042108 100%
              );
              border: 0.5px solid #257932;
            }
          }
        }
        & .value--transaction-status {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 117px;
          height: 36px;
          padding: 0 16px;
          font-size: 16px;
          font-weight: 600;
          color: #00df9a;
          background: rgba(0, 223, 154, 0.2);
          border-radius: 30px;
          & .status__point {
            width: 10px;
            height: 10px;
            background-color: #00df9a;
            border-radius: 50%;
          }
        }
        & .value--transaction-contract {
          & .contract__name {
            font-size: 14px;
            font-weight: 600;
            line-height: 18px;
          }
          & .contract__address {
            margin-top: 7px;
          }
        }
        & .value--transaction-locked {
          & .locked__row1 {
            display: flex;
            & .row1__block {
              display: flex;
              align-items: center;
              &:not(:first-child) {
                margin-left: 30px;
              }
              & .block__label {
                font-size: 12px;
                font-weight: 400;
                line-height: 18px;
                color: #ffffff;
                opacity: 0.5;
              }
              & .block__value {
                margin-left: 8px;
                text-align: center;
              }
            }
          }
          & .locked__row2 {
            display: flex;
            align-items: center;
            margin-top: 10.49px;
            & svg {
              width: 12px;
              height: 12px;
            }
            & .locked__progress {
              width: 121.87px;
              margin: 0 4px;
              & :deep(.el-progress-bar__inner) {
                background: linear-gradient(
                  180deg,
                  #ffffff -26.22%,
                  #fbf0c1 -15.12%,
                  #f8e186 -11.21%,
                  #ba8330 12.03%,
                  #ba8330 19.55%,
                  #6c4b0e 41.87%,
                  #f6bf57 73.18%,
                  #f6bf57 89.26%,
                  #fbf0c1 108.39%
                );
              }
            }
          }
        }
        & .value--transaction-amount {
          display: inline-flex;
          align-items: center;
          & .block__title {
            font-size: 14px;
            font-weight: 600;
            line-height: 18px;
            color: #ffffff;
            text-align: center;
            opacity: 0.5;
          }
          & .block__main {
            width: 193px;
            padding: 12px 0;
            margin-top: 4px;
            background: #212126;
            border: 1px solid #4d4d4d;
            border-radius: 16px;
            & .main__token {
              text-align: center;
              & .token__info {
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                font-weight: 600;
                line-height: 20px;
              }
              & .token__usd {
                margin-top: 4px;
                font-size: 12px;
                font-weight: 400;
                line-height: 18px;
                color: #ffffff;
                opacity: 0.5;
              }
              & .svg__plus {
                margin-top: 4px;
                opacity: 0.3;
              }
              & img {
                width: 24px;
                height: 24px;
                margin-right: 8px;
              }
            }
          }
        }
        & .value--transaction-selling-price {
          display: inline-flex;
          & img {
            width: 16px;
            height: 16px;
            margin-right: 8px;
          }
        }
        & .value--transaction-expiry {
        }
        & .value--transaction-pool {
          display: inline-block;
          padding: 4px 8px;
          font-size: 12px;
          font-weight: 400;
          line-height: 18px;
          border: 1px solid #4d4d4d;
          border-radius: 8px;
          &.is-sell {
            background: #720b05;
          }
          &.is-buy {
            background: #03390b;
          }
        }
        & .value--transaction-filled {
          & .filled__progress--wrap {
            position: relative;
            width: 105.88px;
          }
          & .filled__progress {
            margin-top: 6.49px;
            & :deep(.el-progress-bar__inner) {
              background: linear-gradient(
                180deg,
                #ffffff -26.22%,
                #fbf0c1 -15.12%,
                #f8e186 -11.21%,
                #ba8330 12.03%,
                #ba8330 19.55%,
                #6c4b0e 41.87%,
                #f6bf57 73.18%,
                #f6bf57 89.26%,
                #fbf0c1 108.39%
              );
            }
          }
          & .progress__text {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            font-size: 12px;
            font-weight: 400;
            line-height: 13.03px;
            text-align: center;
          }
        }
        & .row__subtext {
          margin-top: 4px;
          font-size: 12px;
          font-weight: 400;
          line-height: 18px;
          color: #ffffff;
          opacity: 0.5;
        }
      }
    }
  }
}
</style>
