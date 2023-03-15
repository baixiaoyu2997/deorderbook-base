<template>
  <div class="TxHistory">
    <y-dialog
      :model-value="modelValue"
      width="1047px"
      @update:model-value="updateModelValue"
    >
      <TxHistoryHeader @logout="onLogout"></TxHistoryHeader>
      <div class="history__amount">Recent Activity ({{ txHistoryAmount }})</div>
      <TxHistoryList ref="txHistoryListRef"></TxHistoryList>
    </y-dialog>
  </div>
</template>
<script setup lang="ts">
import TxHistoryHeader from './TxHistoryHeader.vue'
import TxHistoryList from './TxHistoryList.vue'
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})
const emits = defineEmits(['update:model-value'])
const updateModelValue = (e: boolean) => {
  emits('update:model-value', e)
}
const onLogout = () => {
  updateModelValue(false)
}
const txHistoryListRef = ref<InstanceType<typeof TxHistoryList> | null>(null)
const txHistoryAmount = computed(() => {
  return txHistoryListRef?.value?.formatTrades.length
})
</script>
<style lang="postcss" scoped>
.TxHistory {
  & .history__amount {
    margin-top: 40px;
    font-size: 16px;
    font-weight: 600;
    line-height: 20px;
  }
}
</style>
