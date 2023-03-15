<template>
  <div class="y-table-input-number">
    <el-input-number
      v-if="!isReadonly"
      ref="elRef"
      v-model="inputValue"
      size="small"
      :controls="false"
      v-bind="{ ...$attrs, ...elProps }"
      :class="classObj"
    />
    <div v-else @click="onClickReadonly">
      <slot>{{ formatColumnValue }}{{ unit }}</slot>
    </div>
  </div>
</template>
<script setup lang="ts">
import { numberFormat } from '~/utils'
/**
 * @description table行内数字编辑组件，支持根据table勾选切换状态
 */
interface Props {
  /**
   * validator 校验函数，无返回值时为正确，否则为错误
   */
  columnScope: {
    [key: string]: any
  }
  unit?: string
  precision?: number
  validator?: (inputValue, scope) => unknown | void
}
// [Init]
const elRef = ref(null)
const props = withDefaults(defineProps<Props>(), {
  unit: 'uHODL',
  precision: 4, // 默认展示4位小数
})
const { columnScope, unit, precision, validator, ...elProps } = toRefs(props)
const { isReadonly, toggleReadonly, columnValue, setColumnNewValue } =
  useEditTableComponent(columnScope)
const inputValue = ref(unref(columnValue))
setColumnNewValue(() => inputValue)

// format column初始值
const formatColumnValue = computed(() => {
  return numberFormat(unref(columnValue), 'en-US', {
    dp: precision.value,
  })
})
const onClickReadonly = () => {
  toggleReadonly(false)
  nextTick(() => {
    elRef.value.focus()
  })
}

// [ validator ]
// 如果有错误时，为其赋值，无错误时值应为undefined
const errorStatus = computed(() => {
  const error = validator.value?.(inputValue.value, columnScope.value)
  return error
})
const classObj = computed(() => {
  return {
    'is-error': errorStatus.value !== undefined,
  }
})

defineExpose({ inputValue, errorStatus })
</script>
<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>
<style lang="postcss" scoped>
.y-table-input-number {
  & :deep(.el-input-number) {
    width: 120px;
  }

  & :deep(.el-input__wrapper.is-focus) {
    border-radius: 8px;
  }

  & .is-error :deep(.el-input__wrapper) {
    border: 0.5px solid var(--border-error);
    border-radius: 8px;
  }
}
</style>
