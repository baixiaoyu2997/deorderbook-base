<template>
  <div class="bullet-table--wrap">
    <y-table
      :data="splitTableData"
      :row-key="getTableRowKey"
      class="BulletTable"
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
          <client-only>
            <y-table-header-filter
              :column="column"
              :row="row"
              :options="headerFilterType"
              @change="onHeaderFilterChange"
            ></y-table-header-filter>
          </client-only>
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
        min-width="95"
      >
        <template #default="{ row }">
          <template v-if="row.inTokens.some((x:any)=>x?.amount)">
            <div
              v-for="item in row.inTokens"
              :key="JSON.stringify(item)"
              class="table__row--token"
            >
              <div class="token__wrap">
                <img
                  :src="getTokenIcon(item.token)"
                  alt=""
                  class="token__icon"
                />
                <div>
                  {{
                    useTokenNumberFormat(div18(item.amount), {
                      token: item.token,
                    })
                  }}
                </div>
                <div>&nbsp;{{ item.token }}</div>
              </div>
              <div class="token__usd">
                {{ useUSDFormat(item.usd, { showApprox: true }) }}
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
        min-width="85"
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
        prop="exerciseTimestamp"
        label="EXPIRY"
        align="right"
        sortable="custom"
        min-width="92"
      >
        <template #default="{ row }">
          <div v-if="row.strikePrice" class="table__row--date">
            <div class="date__text">
              {{
                dayjs(Number(row.exerciseTimestamp) * 1000).format(
                  'MMMM D, YYYY'
                )
              }}
            </div>
            <div class="date__subtext">
              {{
                dayjs(Number(row.exerciseTimestamp) * 1000).format('HH:mm a')
              }}
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
            <div v-if="row.strikePrice">
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
        min-width="70"
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
                dayjs(Number(row[column.property]) * 1000).format(
                  'MMMM D, YYYY'
                )
              }}
            </div>
            <div class="date__subtext">
              {{ dayjs(Number(row[column.property]) * 1000).format('HH:mm a') }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column type="expand" prop="_" width="100">
        <template #default="{ row }">
          <div>
            <span>in amount&nbsp;</span>
            <span>expiry&nbsp;</span>
            <span>strike&nbsp;</span>
          </div>
          <div>
            <span>in amount&nbsp;</span>
            <span>expiry&nbsp;</span>
            <span>strike&nbsp;</span>
          </div>
          <div>
            <span>in amount&nbsp;</span>
            <span>expiry&nbsp;</span>
            <span>strike&nbsp;</span>
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
  </div>
</template>
<script setup lang="ts">
import { Big } from 'big.js'
import dayjs from 'dayjs'

const { getTokenIcon } = useTokens()
const route = useRoute()

// [ Table Base ]
const onTableRowClick = (row: FormatTrade) => {
  return navigateTo(`/tx/${row.txHash}?action=${row.action}`)
}
const getTableRowKey = (row: FormatTrade) => {
  return row.id
}

// [ Type ]
const tableDataType = [
  { label: 'Unwind', value: 'Unwind' }, // done
  { label: 'Buy', value: 'BuyBULLET' }, // block by whitelist
  { label: 'Sell', value: 'SoldBULLET' }, // block by whitelist
  { label: 'List to Sell', value: 'SellBULLET' }, // done
  { label: 'Exercise', value: 'Exercise' }, // done
  { label: 'Claim', value: 'BULLETClaim' }, // done
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

// [ Table Data ]
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
        return Big(xSortValue).minus(ySortValue).toNumber()
      } else {
        return Big(ySortValue).minus(xSortValue).toNumber()
      }
    })
  }
  return sortData.slice(
    (currentPage.value - 1) * pageSize.value,
    pageSize.value * currentPage.value
  )
})

// [ 分页 ]
const currentPage = ref(1)
const pageSize = ref(50)

// [ Filter ]
const filterRecord = ref([] as typeof actionType.value)
// filter type对应多个值，需要进行转换
const onHeaderFilterChange = (e: typeof actionType.value) => {
  const list = [...e]

  // const unstakeType = e.find((x) => x.includes('Unstake'))
  // if (unstakeType) {
  //   list = list.filter((x) => x !== unstakeType)
  //   list.push('Unstake')
  //   list.push('HODLUnstake')
  // }
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
.BulletTable {
  & .el-table__row {
    cursor: pointer;
  }
}
</style>
<style lang="postcss" scoped>
.BulletTable {
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
  & .table__row--strike {
    font-size: 14px;
    font-weight: 600;
    line-height: 18px;
  }
}
</style>
