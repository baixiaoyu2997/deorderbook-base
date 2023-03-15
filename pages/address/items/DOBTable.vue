<template>
  <div>
    <y-table
      :data="splitTableData"
      :row-key="getTableRowKey"
      class="DOBTable"
      @sort-change="sortChange"
      @row-click="onTableRowClick"
    >
      <el-table-column prop="txHash" label="TX HASH">
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
      <el-table-column prop="action" label="TYPE" align="right">
        <template #header="{ row, column }">
          <y-table-header-filter
            :column="column"
            :row="row"
            :options="[
              { label: 'Lock', value: 'Lock' },
              { label: 'Claim', value: 'DOBClaim' },
              { label: 'Withdraw', value: 'Withdraw' },
            ]"
            @change="onHeaderFilterChange"
          ></y-table-header-filter>
        </template>
        <template #default="{ row }">
          {{ row.action === 'DOBClaim' ? 'Claim' : row.action }}
        </template>
      </el-table-column>
      <el-table-column
        prop="inTokens"
        label="IN AMOUNT"
        align="right"
        sortable="custom"
      >
        <template #default="{ row }">
          <template v-if="row.inTokens[0]?.amount">
            <div class="table__row--token">
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
                {{ useUSDFormat(row.inTokens[0].usd, { showApprox: true }) }}
              </div>
            </div>
            <div
              v-if="row.row.inTokens[1].amount"
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
      >
        <template #default="{ row, column }">
          <template v-if="row[column.property]">
            <div class="table__row--token">
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
          </template>
          <div v-else>-</div>
        </template>
      </el-table-column>
      <el-table-column
        prop="lockUntil"
        label="EXPIRY"
        align="right"
        sortable="custom"
      >
        <template #default="{ row }">
          <div v-if="row.action === 'Lock'" class="table__row--date">
            <div class="date__text">
              {{
                dayjs(
                  Number(row.timestamp) * 1000 +
                    Number(dobContractInfo.extendLockDurations) * 1000
                ).format('MMMM D, YYYY')
              }}
            </div>
            <div class="date__subtext">
              {{ dayjs(Number(row.timestamp) * 1000).format('HH:mm a') }}
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
// TODO: 现在withdraw功能没法测试
import { Big } from 'big.js'
import dayjs from 'dayjs'

const { getTokenIcon } = useTokens()
const route = useRoute()

// [ Table Data ]
const onTableRowClick = (row: FormatTrade) => {
  return navigateTo(`/tx/${row.txHash}`)
}
const { trades: tableData } = useTrades({
  pageSize: 1000,
  where: {
    account: route.params.address as string,
    action_in: ['Lock', 'Withdraw', 'DOBClaim'],
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
const getTableRowKey = (row: any) => {
  return row.id
}

// 分页
const currentPage = ref(1)
const pageSize = ref(50)
// filter
const filterRecord = ref([] as ('DOBClaim' | 'Lock' | 'Withdraw')[])
// 排序
const sortRecord = reactive({
  order: null as 'ascending' | 'descending' | null,
  prop: '' as keyof (typeof tableData.value)[0],
})
const sortChange = (obj: any) => {
  sortRecord.prop = obj.prop
  sortRecord.order = obj.order
  currentPage.value = 1
}
const onHeaderFilterChange = (e: ('DOBClaim' | 'Lock' | 'Withdraw')[]) => {
  filterRecord.value = e || []
}

// [ TX HASH]
const hashRef = ref(new Map())
const { copy } = useCopyText()

// [ Expiry ]
const { dobContractInfo } = toRefs(useDOBStore())

// [ Date ]
const datePickerRecord = ref(null as null | string[])
const onHeaderDateChange = (v: null | string[]) => {
  datePickerRecord.value = v
}
</script>
<style lang="postcss">
.DOBTable {
  & .el-table__row {
    cursor: pointer;
  }
}
</style>
<style lang="postcss" scoped>
.DOBTable {
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
}
</style>
