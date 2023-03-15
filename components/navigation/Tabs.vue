<template>
  <el-tabs ref="elRef" v-bind="{ ...$attrs, ...props }" class="y-tabs">
    <template v-for="name in Object.keys($slots)" #[name]>
      <slot :name="name"></slot>
    </template>
  </el-tabs>
</template>
<script setup lang="ts">
import { PropType } from 'vue'
const props = defineProps({
  type: {
    type: String as PropType<'card' | 'border-card'>,
    default: 'border-card',
  },
  stretch: {
    type: Boolean,
    default: true,
  },
  height: {
    type: String,
    default: '72',
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
.y-tabs {
  /* tabs高度 */
  --el-tabs-header-height: v-bind('props.height+"px"');
  background: transparent;
  border: none;

  & :deep(.el-tabs__nav) {
    background: #151515;
  }
  & :deep(.el-tabs__header .el-tabs__item) {
    font-size: 24px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.3);
    background: #151515;
  }
  & :deep(.el-tabs__header .el-tabs__item:not(.is-disabled):hover) {
    color: #fff;
  }
  & :deep(.el-tabs__header .el-tabs__item.is-active) {
    margin: 0;
    color: #fff;
    background: #26262b;
    border: 1px solid #4d4d4d;
    border-bottom: none;
    border-radius: 16px 16px 0px 0px;
  }
  & :deep(.el-tabs__header .el-tabs__item + .el-tabs__item) {
    margin: 0;
  }
  & :deep(.el-tabs__content) {
    padding: 0;
  }
}
</style>
