<template>
  <div class="deorder-history content--max">
    <div v-if="!hideTitle" class="deorder-history-title">{{ title }}</div>
    <div v-loading="isLoading" class="history-table">
      <div v-if="isLoading" class="deorder-no-data"></div>
      <template v-else>
        <div class="tr title">
          <div
            v-for="(optionItem, index) in option.options"
            :key="index"
            :class="'th ' + 'column' + (index + 1)"
            :style="[
              { width: optionItem.width + 'px' },
              {
                textAlign:
                  option.headerStyle?.find(
                    (item) => item.key === optionItem.key
                  )?.align || 'right',
              },
            ]"
          >
            {{ optionItem.label }}
          </div>
        </div>
        <template v-if="tableData.length">
          <div v-for="(item, index) in tableData" :key="index" class="tr">
            <div
              v-for="(optionItem, optionIndex) in option.options"
              :key="optionIndex"
              class="td"
              :class="'column' + (optionIndex + 1)"
              :style="[
                { width: optionItem.width + 'px' },
                {
                  textAlign:
                    option.headerStyle?.find(
                      (item) => item.key === optionItem.key
                    )?.align || 'right',
                },
              ]"
            >
              <slot :name="optionItem.key" :row="item" :column="optionItem">
                <span
                  v-if="optionItem.key === 'timestamp'"
                  class="table--timestamp"
                >
                  <img :src="getTokenIcon(item.tokenSymbol)" alt="" />
                  {{
                    dayjs
                      .utc(new Date(Number(item[optionItem.key]) * 1000))
                      .format('DD MMM, HH:mm')
                  }}
                </span>
                <span v-else-if="optionItem.key === 'amount'">
                  {{
                    useTokenNumberFormat(
                      maxLength(div18(item[optionItem.key])),
                      { token: item.tokenSymbol as any }
                    )
                  }}
                  {{ item.tokenSymbol }}
                </span>
                <span v-else-if="optionItem.key === 'from'">
                  {{ getFromOrToText(item, 'from') }}
                </span>
                <span v-else-if="optionItem.key === 'to'">
                  {{ getFromOrToText(item, 'to') }}
                </span>
                <span v-else>
                  {{ item[optionItem.key] }}
                </span>
              </slot>
            </div>
          </div>
        </template>
        <y-nodata v-else></y-nodata>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getTradeList } from 'deorderbook-sdk'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import {
  TradeList,
  TradeListOption,
} from 'deorderbook-sdk/dist/src/subgraph-api.js'
import { TextAlignProperty } from 'csstype'
import Big from 'big.js'
import { div18, numberFormat } from '~/utils'
import iconUSDC from '~/assets/img/icon_usdc@2x.png'
import iconWBTC from '~/assets/img/icon_wbtc@2x.png'
import iconDOB from 'assets/img/icon_coin_dob@2x.png'
import iconBHODL from '~/assets/img/icon_bhodl@2x.png'
import iconUHODL from '~/assets/img/icon_coin_uHODL@2x.png'
import iconBSniper from '~/assets/img/icon_b_sniper@2x.png'
import iconUSniper from '~/assets/img/icon_coin_uSniper@2x.png'
import iconBBullet from '~/assets/img/icon_b_bullet@2x.png'
import iconUBullet from '~/assets/img/icon_coin_uBullet@2x.png'

dayjs.extend(utc)

interface tableItemType {
  account: string
  action: string
  amount: string
  exerciseTimestamp: string
  from: string
  id: string
  optionType: string
  strikePrice: string
  timestamp: string
  token: string
  tokenSymbol: string
  txHash: string
  to: string
}
interface optionItemType {
  label: string
  key: string
  width?: string | number
  style?: string
}
interface historyData {
  options: Array<optionItemType>
  headerStyle?: Array<{
    key: string
    style?: string
    align?: TextAlignProperty
  }>
}
interface Props {
  loading?: boolean
  option?: historyData
  data?: Array<tableItemType>
  title?: string
  from?:
    | 'HODL'
    | 'Deorder'
    | 'Lock'
    | 'SNIPER&BULLET'
    | 'Bullet Markets'
    | 'My BULLET'
  hideTitle?: boolean
  pageSize?: number
}
const props = withDefaults(defineProps<Props>(), {
  loading: true,
  title: 'Transaction History',
  hideTitle: false,
  pageSize: 10,
  from: undefined,
  option: undefined,
  data: undefined,
})
const tableData = ref<Array<tableItemType | TradeList>>([])
const option = ref<historyData>(
  Object.assign(
    {
      options: [
        { label: 'Time', key: 'timestamp', width: 160 },
        { label: 'Action', key: 'action', width: 120 },
        {
          label: 'Amount',
          key: 'amount',
          width: 200,
        },
        { label: 'From', key: 'from' },
        { label: 'To', key: 'to' },
      ],
      headerStyle: [{ key: 'timestamp', align: 'left' }],
    },
    props.option
  )
)
const { address } = useWallet()
const isLoading = ref(false)
const getData = async () => {
  if (!address.value) {
    isLoading.value = false
    return
  }
  isLoading.value = true
  const queryObj: TradeListOption = {
    address: address.value,
    pageSize: props.pageSize,
  }
  if (props.from) {
    queryObj.where = { from: props.from }
  }
  const res = await getTradeList(queryObj)
  isLoading.value = false
  tableData.value = res
}
useRefsInit(() => {
  getData()
})
watch(
  () => address.value,
  () => {
    if (address.value) {
      getData()
    }
  },
  {
    immediate: true,
  }
)
const getTokenIcon = (tokenSymbol: string) => {
  let icon = iconUSDC
  switch (tokenSymbol.toLowerCase()) {
    case 'uhodl':
      icon = iconUHODL
      break
    case 'bhodl':
      icon = iconBHODL
      break
    case 'usdc':
      icon = iconUSDC
      break
    case 'wbtc':
      icon = iconWBTC
      break
    case 'dob':
      icon = iconDOB
      break
    case 'bsniper':
      icon = iconBSniper
      break
    case 'usniper':
      icon = iconUSniper
      break
    case 'sniper':
      icon = iconUSniper
      break
    case 'bbullet':
      icon = iconBBullet
      break
    case 'ubullet':
      icon = iconUBullet
      break
  }
  return icon
}
const getFromOrToText = (row, type) => {
  const typeEnum = {
    from: {
      '0': 'Contract',
      '1': 'Wallet',
      '2': 'Pool',
      '3': 'Wallet',
      '4': 'Pool',
      '5': 'Contract',
    },
    to: {
      '0': 'Wallet',
      '1': 'Contract',
      '2': 'Wallet',
      '3': 'Pool',
      '4': 'Contract',
      '5': '--',
    },
  }

  return typeEnum[type][row.to]
}
const maxLength = (value) => {
  return Big(value).round(9, 0).toFixed()
}
</script>

<style lang="postcss" scoped>
.deorder-history {
  padding: 68px 0 80px;

  & .deorder-history-title {
    margin-bottom: 40px;
    font-size: 32px;
    font-weight: 700;
  }

  & .deorder-history-pagination {
    margin-top: 64px;
    text-align: center;
  }

  & .history-table {
    width: 100%;
    font-size: 14px;
    border-radius: 6px;

    & .tr {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 92px;
      padding: 0 24px;
      margin: 12px 0;
      background: var(--dialog-bg);
      border-radius: 8px;

      &.title {
        height: auto;
        margin-bottom: 24px;
        font-size: 12px;
        color: #fff6;
        background: transparent;
      }

      & .th {
        min-width: 80px;
      }

      & .td {
        display: inline-block;
        min-width: 80px;
        font-weight: 500;
        word-break: break-all;

        & .table--timestamp {
          display: flex;
          align-items: center;

          & img {
            width: 40px;
            height: 40px;
            margin-right: 16px;
          }
        }

        & :deep(p) {
          margin: 5px 0;
          color: white;
        }
        & :deep(p.pending, p.exercising) {
          color: #ff4848;
        }
      }

      & :deep(.date-time) {
        display: flex;
        align-items: center;

        & img {
          width: 40px;
          margin-right: 14px;
        }
      }
    }
  }
}
</style>
