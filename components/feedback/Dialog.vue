<template>
  <el-dialog
    destroy-on-close
    ref="elRef"
    v-bind="{ ...$attrs, ...props }"
    class="YDialog"
  >
    <template v-if="$slots.header" #header>
      <slot name="header"></slot>
    </template>
    <template #default>
      <slot name="default"></slot>
    </template>
    <template v-if="$slots.footer" #footer>
      <slot name="footer"></slot>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { dialogProps } from 'element-plus'

// 父组件通过ref.value.elRef.xxx调用element-ui组件方法
const elRef = ref(null)
const props = defineProps({
  ...dialogProps,
  /** 弹窗是否居中，默认为true */
  alignCenter: {
    type: dialogProps.alignCenter.type,
    default: true,
  },
  /** 内容是否居中，默认为true */
  center: {
    type: Boolean,
    default: true,
  },
  width: {
    type: dialogProps.width.type,
    default: '418px',
  },
})

// defineEmits(buttonEmits) 不要添加defineEmits，会阻断子组件触发事件
</script>
<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>
<style lang="postcss">
.YDialog.el-dialog {
  padding-bottom: 16px;
  color: var(--color);
  background: radial-gradient(
    49.67% 49.67% at 88.76% 5.88%,
    #323232 0%,
    #26262b 95.31%
  );
  border: 0.5px solid #4d4d4d;
  border-radius: 16px;

  & .el-dialog__header {
    padding: 0;
    margin-top: 24px;
    margin-right: 0;
    font-size: 20px;
    font-weight: 600;
    line-height: 30px;
  }
  & .el-dialog__headerbtn {
    top: 12px;
    right: 12px;
    width: 24px;
    height: 24px;
    font-size: 24px;
  }
  & .el-dialog__body {
    padding: 24px 24px 0;
  }
  & .el-dialog__footer {
    /* padding: 24px 24px 0; */
    padding-bottom: 0;
    margin-top: 24px;
  }
}
</style>
