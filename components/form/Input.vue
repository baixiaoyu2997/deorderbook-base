<template>
  <el-input
    ref="elRef"
    v-bind="{ ...$attrs, ...props }"
    class="y-input"
    :style="styleObj"
    :class="classObj"
  >
    <template #prefix>
      <slot name="prefix"></slot>
    </template>
    <template v-if="$slots.suffix" #suffix>
      <slot name="suffix"></slot>
    </template>
  </el-input>
</template>
<script setup lang="ts">
const slots = useSlots()
// 父组件通过ref.value.elRef.xxx调用element-ui组件方法
const elRef = ref(null)
const props = defineProps({
  // eslint-disable-next-line vue/require-default-prop
  height: String,
  label: {
    type: String,
    default: '', // input 标题
  },
  alignCenter: Boolean, // 居中显示input值
})
const { labelClass, labelStyle } = useFormLabel()

const classObj = reactive({
  'align-center': props.alignCenter,
  'has-prefix': slots.prefix,
  ...labelClass.value,
})

const styleObj = computed(() => {
  return {
    '--el-input-height': props.height && `${Number(props.height)}px`,
    ...labelStyle.value,
  }
})
</script>
<script lang="ts">
/* eslint-disable vue/no-parsing-error */
export default {
  inheritAttrs: false,
}
</script>
<style lang="postcss" scoped>
.y-input {
  position: relative;

  &.align-center :deep(input) {
    text-align: center;
  }

  /* prefix style */
  &.has-prefix :deep(.el-input__wrapper) {
    padding-left: 0;

    & .el-select {
      width: 157px;
      margin-right: 16px;

      &::after {
        position: absolute;
        top: 5px;
        right: 0;
        bottom: 5px;
        width: 1px;
        content: '';
        background-color: var(--border-color-lighter);
      }

      & .select-trigger {
        padding-left: 16px;
      }

      & .el-input__wrapper {
        padding-right: 16px;
        border: none;
      }

      & .el-input__suffix-inner > :first-child {
        margin-left: 0;
      }

      & .el-input__prefix-inner > :last-child {
        margin-right: 8px;
      }
    }
  }
}
</style>
