<template>
  <el-pagination
    v-bind="{ ...$attrs, ...props }"
    :style="styleObj"
    class="y-pagination"
  ></el-pagination>
</template>
<script setup lang="ts">
// graph-node还不支持获取返回数据总数：https://github.com/graphprotocol/graph-node/issues/1309
import type { paginationProps } from 'element-plus/es/components/pagination'

// import type { PropType } from 'vue'
// 如果要修改组件name，需要同步修改Table其他组件内名称

const props = defineProps({
  ...({} as unknown as typeof paginationProps),
  // [ 以下为自定义属性 ]
  /**
   * 注意：el-table高度，但是组件会自动减去wrapPadding
   */
  headerHeight: {
    type: String,
    default: '18',
  },
  headerBottom: {
    default: '8',
    type: String,
  },
  /**
   * 最外层padding,会影响el-table的height属性
   */
  wrapPadding: {
    type: String,
    default: '32',
  },
})

const styleObj = reactive({
  // height: props.height === '100%' ? '100%' : undefined,
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
.y-pagination {
  --el-color-primary: #fff;
  /* background */
  --el-pagination-bg-color: transparent;
  /* prev and next button disabled background */
  --el-pagination-button-disabled-bg-color: transparent;
  /* prev and next button color */
  --el-pagination-button-color: #fff;
  /* active page font color */
  --el-pagination-hover-color: #fff;
  /* page font color */
  --el-pagination-text-color: rgba(255, 255, 255, 0.5);
}
</style>
