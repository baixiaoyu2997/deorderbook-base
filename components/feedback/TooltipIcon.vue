<template>
  <div class="y-tooltip-icon">
    <div class="tooltip__before">
      <slot name="before" />
    </div>
    <el-tooltip ref="elRef" v-bind="{ ...$attrs, ...props }">
      <component
        :is="iconEnum[icon]"
        :width="iconSize"
        :height="iconSize"
        :style="{ color: iconColor }"
      ></component>
    </el-tooltip>
    <div class="tooltip__after">
      <slot name="after" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ElTooltipProps } from 'element-plus'
import type { ExtractPropTypes, PropType } from 'vue'
import SVGInfo from '~icons/ic/outline-info'

const props = defineProps({
  // 原生组件属性
  ...{
    popperClass: {
      type: String,
      default: 'y-tooltip__popper',
    },
    placement: {
      type: String,
      default: 'top',
    },
  }, // 重点,赋予ui props提示
  icon: {
    type: String as PropType<'info'>,
    default: 'info',
  },
  iconColor: {
    type: String,
    default: 'rgba(255, 255, 255, 0.4)',
  },
  iconSize: {
    type: Number,
    default: 14,
  },
  marginLeft: {
    type: Number,
    default: 4,
  },
  marginRight: {
    type: Number,
    default: 4,
  },
})
const iconEnum = {
  info: SVGInfo,
}
const elRef = ref(null)
</script>
<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>
<style lang="postcss" scoped>
.y-tooltip-icon {
  display: inline-flex;
  align-items: center;
  & .tooltip__before {
    margin-right: v-bind('props.marginRight + "px"');
  }
  & .tooltip__after {
    margin-left: v-bind('props.marginLeft + "px"');
  }
}
</style>
<style>
body .el-popper.y-tooltip__popper {
  max-width: 272.1px;
  padding: 8px 12px;
  color: rgba(255, 255, 255, 0.8);
  word-break: break-word;
  background: #34343a;
  border: none;
  border: 0.5px solid #4d4d4d;
  border-radius: 8px;
}
body .el-popper.y-tooltip__popper .el-popper__arrow::before {
  background-color: #34343a !important;
  border-right-color: #4d4d4d !important;
  border-bottom-color: #4d4d4d !important;
}
</style>
