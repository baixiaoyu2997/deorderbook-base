<template>
  <div class="TxHistoryList">
    <template v-if="formatTrades.length !== 0">
      <div v-for="item in formatTrades" :key="item.id" class="trade__list">
        <div v-if="item.isFirstTxOfDay" class="list__day">
          {{ dayjs(Number(item.timestamp + '000')).format('MMMM D, YYYY') }}
        </div>
        <TxHistoryListItem
          :trade-item="item"
          class="list__item"
        ></TxHistoryListItem>
      </div>
    </template>
    <div v-else class="list__empty">No Transaction Activity</div>
  </div>
</template>
<script setup lang="ts">
import dayjs from 'dayjs'
import TxHistoryListItem from './TxHistoryListItem.vue'

const { trades } = useTrades()

const formatTrades = computed(() => {
  return trades.value.map((x, index) => {
    // 当天第一个交易事件
    let isFirstTxOfDay = false
    if (index === 0) {
      isFirstTxOfDay = true
    } else {
      isFirstTxOfDay = !dayjs(
        Number(trades.value[index - 1].timestamp + '000')
      ).isSame(Number(x.timestamp + '000'), 'day')
    }

    return {
      ...x,
      isFirstTxOfDay,
    }
  })
})
defineExpose({
  formatTrades,
})
</script>
<style lang="postcss" scoped>
.TxHistoryList {
  & .trade__list {
    & .list__day {
      margin-top: 40px;
      font-size: 20px;
      font-weight: 600;
      line-height: 24px;
    }
    & .list__item {
      margin-top: 16px;
    }
  }
  & .list__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 180px;
    margin-top: 40px;
    font-size: 16px;
    font-weight: 400;
    line-height: 20px;
    color: #ffffff;
    background: #26262b;
    border: 1px solid #4d4d4d;
    border-radius: 16px;
    opacity: 0.5;
  }
}
</style>
