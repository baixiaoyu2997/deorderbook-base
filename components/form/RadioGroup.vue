<template>
  <el-radio-group
    ref="elRef"
    v-bind="{ ...$attrs, ...props }"
    class="y-radio-group"
  >
    <template #default>
      <slot name="default"></slot>
    </template>
  </el-radio-group>
</template>
<script setup lang="ts">
import { radioGroupProps } from 'element-plus'
import type { PropType } from 'vue'
// 父组件通过ref.value.elRef.xxx调用element-ui组件方法
const elRef = ref(null)
const props = defineProps({
  ...({} as unknown as typeof radioGroupProps),
  // [ 以下为自定义属性 ]
  /** 多个radio之间的间距,支持数字或者数字字符串，单位为px,其他字符串为原生语法 */
  radioSpace: {
    type: [String, Number],
    default: '0',
  },
  /** radio宽度，默认100%,支持数字或者数字字符串，单位为px,其他字符串为原生语法 */
  radioWidth: {
    type: [String, Number],
    default: '100%',
  },
  /** radio高度，默认34,支持数字或者数字字符串，单位为px,其他字符串为原生语法 */
  radioHeight: {
    type: String,
    default: '34',
  },
})
// defineEmits(buttonEmits) 不要添加defineEmits，会阻断子组件触发事件
const styleBind = computed(() => {
  return {
    radioWidth: Number(props?.radioWidth)
      ? `${props.radioWidth}px`
      : props?.radioWidth,
    radioHeight: Number(props?.radioHeight)
      ? `${props.radioHeight}px`
      : props?.radioHeight,
    radioMargin: Number(props?.radioSpace)
      ? `${props.radioSpace}px`
      : props?.radioHeight,
  }
})
</script>
<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>
<style lang="postcss" scoped>
.y-radio-group.el-radio-group {
  flex-wrap: nowrap;
  & :deep(.el-radio) {
    justify-content: center;
    width: v-bind(styleBind.radioWidth);
    height: v-bind(styleBind.radioHeight);
    padding: 0 8px; /* radio默认左右padding覆盖,需要同时设置el-radio__label padding */
    background: #212126;
    border: 0.5px solid #777777;
    border-radius: 44px;
    box-shadow: inset 0px 0px 6px #141414;
    &:not(:last-child) {
      margin-right: v-bind('styleBind.radioMargin'); /* radio默认右边距覆盖 */
    }
    & .el-radio__input {
      display: none; /* radio 圆点隐藏 */
    }
    & .el-radio__label {
      padding-left: 0; /* 去掉radio 圆点样式时，左侧的padding */
      font-size: 14px;
      font-weight: 400;
    }
  }
  &:deep(.is-checked) {
    & .el-radio__label {
      color: #00df9a; /* radio文字颜色 */
    }
  }
}
</style>
