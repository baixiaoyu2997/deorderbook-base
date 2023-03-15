<template>
  <y-dialog
    v-bind="{ ...$attrs, ...props }"
    width="418px"
    title="DeOrder"
    center
  >
    <DeorderBuyOrSell
      :from-token="fromToken"
      :strike-price="strikePrice"
      :exercise-timestamp="exerciseTimestamp"
    ></DeorderBuyOrSell>
  </y-dialog>
</template>

<script lang="ts" setup>
import DeorderBuyOrSell from '~/pages/deorder/items/DeorderBuyOrSell.vue'

const props = defineProps({
  fromToken: String,
  strikePrice: String,
  // in second unit
  exerciseTimestamp: String,
})
</script>

<style lang="postcss"></style>
