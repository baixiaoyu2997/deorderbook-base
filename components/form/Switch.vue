<template>
  <el-switch
    ref="elRef"
    v-bind="{ ...$attrs, ...props }"
    class="y-switch"
  ></el-switch>
</template>
<script setup lang="ts">
const props = defineProps({
  width: {
    type: Number,
    default: 42,
  },
})

// 父组件通过ref.value.elRef.xxx调用element-ui组件方法
const elRef = ref(null)
</script>
<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>
<style lang="postcss" scoped>
.y-switch {
}
</style>
