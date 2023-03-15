<template>
  <y-table
    :data="splitTableData"
    :row-key="getTableRowKey"
    class="PoolTable"
    @sort-change="sortChange"
    @row-click="onTableRowClick"
  >
    <el-table-column prop="txHash" label="TX HASH" width="143">
      <template #default="{ row }">
        <y-address-copy
          :address="row.txHash"
          :icon-size="16"
          :underline="false"
          ellipsis
          stop-propagation
        ></y-address-copy>
      </template>
    </el-table-column>
    <el-table-column prop="action" label="TYPE" align="right" min-width="45">
      <template #header="{ row, column }">
        <y-table-header-filter
          :column="column"
          :row="row"
          :options="headerFilterType"
          @change="onHeaderFilterChange"
        ></y-table-header-filter>
      </template>
      <template #default="{ row }">
        <div class="table__row--type">
          {{ tableDataType.find((x) => x.value === row.action)?.label }}
        </div>
      </template>
    </el-table-column>
    <el-table-column
      prop="inTokens"
      label="IN AMOUNT"
      align="right"
      sortable="custom"
      min-width="87"
    >
      <template #default="{ row }">
        <template v-if="row.inTokens.some((x:any) => x?.amount)">
          <div v-if="row.inTokens[0].amount" class="table__row--token">
            <div class="token__wrap">
              <img
                :src="getTokenIcon(row.inTokens[0].token)"
                alt=""
                class="token__icon"
              />
              <div>
                {{
                  useTokenNumberFormat(div18(row.inTokens[0].amount), {
                    token: row.inTokens[0].token,
                  })
                }}
              </div>
              <div>&nbsp;{{ row.inTokens[0].token }}</div>
            </div>
            <div class="token__usd">
              {{
                useUSDFormat(row.inTokens[0]?.usd || '0', { showApprox: true })
              }}
            </div>
          </div>
          <div
            v-if="row.inTokens[1]?.amount"
            class="table__row--token"
            style="margin-top: 8px"
          >
            <div class="token__wrap">
              <img
                :src="getTokenIcon(row.inTokens[1].token)"
                alt=""
                class="token__icon"
              />
              <div>
                {{
                  useTokenNumberFormat(div18(row.inTokens[1].amount), {
                    token: row.inTokens[1].token,
                  })
                }}
              </div>
              <div>&nbsp;{{ row.inTokens[1].token }}</div>
            </div>
            <div class="token__usd">
              {{ useUSDFormat(row.inTokens[1].usd, { showApprox: true }) }}
            </div>
          </div>
        </template>
        <div v-else>-</div>
      </template>
    </el-table-column>
    <el-table-column
      prop="outTokenAmount"
      label="OUT AMOUNT"
      align="right"
      sortable="custom"
      min-width="87"
    >
      <template #default="{ row, column }">
        <template v-if="row.outTokenAmount || row.outToken2Amount">
          <div v-if="row.outTokenAmount" class="table__row--token">
            <div class="token__wrap">
              <img
                :src="getTokenIcon(row.outToken)"
                alt=""
                class="token__icon"
              />
              <div>
                {{
                  useTokenNumberFormat(div18(row[column.property]), {
                    token: row.outToken,
                  })
                }}
              </div>
              <div>&nbsp;{{ row.outToken }}</div>
            </div>
            <div class="token__usd">
              {{ useUSDFormat(row.outTokenUSD, { showApprox: true }) }}
            </div>
          </div>
          <div v-if="row.outToken2Amount" class="table__row--token">
            <div class="token__wrap">
              <img
                :src="getTokenIcon(row.outToken2)"
                alt=""
                class="token__icon"
              />
              <div>
                {{
                  useTokenNumberFormat(div18(row.outToken2Amount), {
                    token: row.outToken2,
                  })
                }}
              </div>
              <div>&nbsp;{{ row.outToken2 }}</div>
            </div>
            <div class="token__usd">
              {{ useUSDFormat(row.outToken2USD, { showApprox: true }) }}
            </div>
          </div>
        </template>
        <div v-else>-</div>
      </template>
    </el-table-column>
    <el-table-column
      prop="pool"
      label="POOL"
      align="right"
      sortable="custom"
      min-width="80"
    >
      <template #default="{ row }">
        <div v-if="['Mint', 'Redeem'].includes(row.action)">-</div>
        <div v-else class="table__row--pool" :class="setPoolClass(row)">
          {{ row.pool }}
        </div>
      </template>
    </el-table-column>
    <el-table-column
      prop="exerciseTimestamp"
      label="EXPIRY"
      align="right"
      sortable="custom"
      min-width="80"
    >
      <template #default="{ row }">
        <div
          v-if="row.strikePrice && !['Claim'].includes(row.action)"
          class="table__row--date"
        >
          <div class="date__text">
            {{
              dayjs(Number(row.exerciseTimestamp) * 1000).format('MMMM D, YYYY')
            }}
          </div>
          <div class="date__subtext">
            {{ dayjs(Number(row.exerciseTimestamp) * 1000).format('HH:mm a') }}
          </div>
        </div>
        <div v-else>-</div>
      </template>
    </el-table-column>
    <el-table-column
      prop="strikePrice"
      label="STRIKE"
      align="right"
      sortable="custom"
      width="86"
    >
      <template #default="{ row }">
        <div class="table__row--strike">
          <div v-if="row.strikePrice && !['Claim'].includes(row.action)">
            ${{ numberFormat(div18(row.strikePrice || '0')) }}
          </div>
          <div v-else>-</div>
        </div>
      </template>
    </el-table-column>
    <el-table-column
      prop="fees"
      label="FEES"
      align="right"
      sortable="custom"
      min-width="80"
    >
      <template #default="{ row }">
        <div v-if="row.fees" class="table__row--token">
          <div class="token__wrap">
            <div>
              {{
                useTokenNumberFormat(div18(row.fees || '0'), {
                  token: row.feeToken,
                })
              }}
            </div>
            <div>&nbsp;{{ row.feeToken }}</div>
          </div>
          <div class="token__usd">
            {{ useUSDFormat(row.feesUSD || '0', { showApprox: true }) }}
          </div>
        </div>
        <div v-else>-</div>
      </template>
    </el-table-column>
    <el-table-column
      prop="timestamp"
      label="DATE"
      align="right"
      sortable="custom"
      width="174"
    >
      <template #header>
        <YTableHeaderDate @change="onHeaderDateChange"></YTableHeaderDate>
      </template>
      <template #default="{ row, column }">
        <div class="table__row--date">
          <div class="date__text">
            {{
              dayjs(Number(row[column.property]) * 1000).format('MMMM D, YYYY')
            }}
          </div>
          <div class="date__subtext">
            {{ dayjs(Number(row[column.property]) * 1000).format('HH:mm a') }}
          </div>
        </div>
      </template>
    </el-table-column>
    <template #pagination>
      <y-pagination
        v-model:current-page="currentPage"
        prev-text="Previous"
        next-text="Next"
        layout="prev, pager, next"
        :default-page-size="pageSize"
        :total="tableData.length"
      />
    </template>
  </y-table>
</template>
<script setup lang="ts">
import { Big } from 'big.js'
import dayjs from 'dayjs'

const { getTokenIcon } = useTokens()
const route = useRoute()

// [ Type ]
const tableDataType = [
  { label: 'Unstake', value: 'Unstake' },
  { label: 'Sell', value: 'DeOrderSell' },
  { label: 'Buy', value: 'DeOrderBuy' },
  { label: 'Mint', value: 'Mint' },
  { label: 'Redeem', value: 'Redeem' },
  { label: 'Stake', value: 'Stake' },
  { label: 'Stake', value: 'HODLStake' },
  { label: 'Unstake', value: 'HODLUnstake' },
  { label: 'Claim', value: 'Claim' },
  { label: 'Claim', value: 'HODLClaim' },
  { label: 'Collect', value: 'Collect' },
  { label: 'Unwind', value: 'Unwind' },
] as const
const actionType = computed(() => {
  return tableDataType.map((x) => x.value)
})
const headerFilterType = computed(() => {
  const obj = {} as any
  tableDataType.forEach((x) => {
    obj[x.label] = x.value
  })
  return Object.keys(obj).map((x) => {
    return {
      label: x,
      value: obj[x],
    }
  })
})

// [ Pool ]
const setPoolClass = (row: any) => {
  return {
    'is-buy': row?.pool?.endsWith?.('Bull'),
    'is-sell': row?.pool?.endsWith?.('Bear'),
    'is-uhodl': row?.pool === 'uHODL',
    'is-bhodl': row?.pool === 'bHODL',
  }
}

// [ Expiry ]

// [ Table Data ]
const onTableRowClick = (row: FormatTrade) => {
  return navigateTo(`/tx/${row.txHash}`)
}
const { trades: tableData } = useTrades({
  pageSize: 1000,
  where: {
    account: route.params.address as string,
    action_in: actionType.value,
  },
})
const splitTableData = computed(() => {
  let filterData = [...tableData.value]
  if (filterRecord.value.length !== 0) {
    filterData = filterData.filter((x) =>
      filterRecord.value.includes(x.action as any)
    )
  }
  if (datePickerRecord.value !== null) {
    filterData = filterData.filter((x) => {
      return (
        Big(x.timestamp).gte(datePickerRecord.value![0]) &&
        Big(x.timestamp).lte(datePickerRecord.value![1])
      )
    })
  }
  let sortData = filterData
  if (sortRecord?.order) {
    sortData = sortData.sort((x, y) => {
      let xSortValue = (x[sortRecord?.prop] || '0') as string
      if (sortRecord?.prop === 'inTokens') {
        xSortValue = x[sortRecord?.prop][0]?.amount || '0'
      }
      let ySortValue = (y[sortRecord?.prop] || '0') as string
      if (sortRecord?.prop === 'inTokens') {
        ySortValue = y[sortRecord?.prop][0]?.amount || '0'
      }
      if (sortRecord.order === 'ascending') {
        if (sortRecord?.prop === 'pool') {
          return xSortValue.localeCompare(ySortValue)
        }
        return Big(xSortValue).minus(ySortValue).toNumber()
      } else {
        if (sortRecord?.prop === 'pool') {
          return ySortValue.localeCompare(xSortValue)
        }
        return Big(ySortValue).minus(xSortValue).toNumber()
      }
    })
  }
  return sortData.slice(
    (currentPage.value - 1) * pageSize.value,
    pageSize.value * currentPage.value
  )
})
const getTableRowKey = (row: any) => {
  return row.id
}

// [ 分页 ]
const currentPage = ref(1)
const pageSize = ref(50)

// [ Filter ]
const filterRecord = ref([] as typeof actionType.value)
// filter type对应多个值，需要进行转换
const onHeaderFilterChange = (e: typeof actionType.value) => {
  let list = [...e]
  const claimType = e.find((x) => x.includes('Claim'))
  if (claimType) {
    list = list.filter((x) => x !== claimType)
    list.push('Claim')
    list.push('HODLClaim')
  }
  const stakeType = e.find((x) => x.includes('Stake'))
  if (stakeType) {
    list = list.filter((x) => x !== stakeType)
    list.push('Stake')
    list.push('HODLStake')
  }
  const unstakeType = e.find((x) => x.includes('Unstake'))
  if (unstakeType) {
    list = list.filter((x) => x !== unstakeType)
    list.push('Unstake')
    list.push('HODLUnstake')
  }
  filterRecord.value = list || []
}

// [ Sort ]
const sortRecord = reactive({
  order: null as 'ascending' | 'descending' | null,
  prop: '' as keyof (typeof tableData.value)[0],
})
const sortChange = (obj: any) => {
  sortRecord.prop = obj.prop
  sortRecord.order = obj.order
  currentPage.value = 1
}

// [ Date ]
const datePickerRecord = ref(null as null | string[])
const onHeaderDateChange = (v: null | string[]) => {
  datePickerRecord.value = v
}
</script>
<style lang="postcss">
.PoolTable {
  & .el-table__row {
    cursor: pointer;
  }
}
</style>
<style lang="postcss" scoped>
.PoolTable {
  & .table__row--type {
    font-size: 14px;
    font-weight: 600;
    line-height: 18px;
  }
  & .table__row--token {
    & .token__wrap {
      display: inline-flex;
      align-items: center;
      font-size: 14px;
      font-weight: 600;
      line-height: 18px;
      & .token__icon {
        width: 16px;
        height: 16px;
        margin-right: 4px;
      }
    }
    & .token__usd {
      margin-top: 4px;
      font-size: 11px;
      font-weight: 400;
      line-height: 18px;
      opacity: 0.5;
    }
    &:not(:first-child) {
      margin-top: 8px;
    }
  }
  & .table__row--date {
    & .date__text {
      font-size: 14px;
      font-weight: 600;
      line-height: 18px;
    }
    & .date__subtext {
      margin-top: 4px;
      font-size: 11px;
      font-weight: 400;
      line-height: 18px;
      opacity: 0.5;
    }
  }
  & .table__row--pool {
    display: inline-block;
    padding: 4px 8px;
    font-size: 12px;
    line-height: 18px;
    border: 1px solid #4d4d4d;
    border-radius: 8px;
    &.is-buy {
      background-color: #03390b;
    }
    &.is-sell {
      background-color: #720b05;
    }
    &.is-uhodl {
      background-color: #0b2a5b;
    }
    &.is-bhodl {
      background-color: #7b3700;
    }
  }
  & .table__row--strike {
    font-size: 14px;
    font-weight: 600;
    line-height: 18px;
  }
}
</style>
