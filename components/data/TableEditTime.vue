<template>
  <div class="y-table-edit-time">
    <template v-if="!isReadonly">
      <el-input-number
        ref="hourElRef"
        v-model="hourValue"
        size="small"
        :controls="false"
        :precision="0"
        v-bind="{ ...$attrs, ...elProps }"
        :class="classObj"
      />
      hrs
      <el-input-number
        v-model="minsValue"
        :controls="false"
        size="small"
        :precision="0"
        :max="59"
        v-bind="{ ...$attrs, ...elProps }"
        :class="classObj"
      />
      mins
    </template>
    <div v-else @click="onClickReadonly">
      <slot>{{ formatColumnValue }}</slot>
    </div>
  </div>
</template>
<script setup lang="ts">
/**
 * @description table行内编辑时间组件，只支持显示小时和分钟,接收和返回的数据都为毫秒,支持根据table勾选切换状态
 */

interface Props {
  /**
   * column的scope数据，必填
   */
  columnScope: {
    [key: string]: any
  }
  /**
   * validator 校验函数，无返回值时为正确，否则为错误
   */
  validator?: (hourValue, minsValue, scope) => unknown | void
  defaultTime?: {
    hour: number
    mins: number
  }
}
// [Init]
const hourElRef = ref(null)
const props = defineProps<Props>()
const { columnScope, validator, ...elProps } = toRefs(props)

const {
  isReadonly,
  toggleReadonly,
  columnValue,
  setColumnNewValue,
  onRowSelectionChange,
} = useEditTableComponent(columnScope)

setColumnNewValue(
  () => hourValue.value * 60 * 60 * 1000 + minsValue.value * 60 * 1000
)
const onClickReadonly = () => {
  toggleReadonly(false)
  nextTick(() => {
    hourElRef.value.focus()
  })
}
onRowSelectionChange((selected) => {
  if (selected) {
    hourValue.value = getHours(columnValue)
    minsValue.value = getMins(columnValue)
  }
})

// format column初始值
const formatColumnValue = computed(() => {
  if (Number(unref(columnValue)) <= 0) return '--'
  return `${getHours(columnValue)}hrs ${getMins(columnValue)}mins`
})

const getHours = (time) => {
  const timeNumber = Number(unref(time))
  if (timeNumber <= 0) {
    return props.defaultTime.hour || 0
  }
  return Math.floor(timeNumber / 1000 / 60 / 60)
}
const getMins = (time) => {
  const timeNumber = Number(unref(time))
  if (timeNumber <= 0) {
    return props.defaultTime.mins || 0
  }
  return Math.floor((timeNumber / 1000 / 60 / 60 - getHours(time)) * 60)
}

const hourValue = ref(getHours(columnValue))
const minsValue = ref(getMins(columnValue))

watch(
  [hourValue, minsValue],
  () => {
    if (hourValue.value >= 72) {
      nextTick(() => {
        hourValue.value = 72
        minsValue.value = 0
      })
    }
  },
  { deep: true }
)
// [ validator ]
// 如果有错误时，为其赋值，无错误时值应为undefined
const errorStatus = computed(() => {
  const error = validator.value?.(
    hourValue.value,
    minsValue.value,
    columnScope.value
  )

  return error
})
const classObj = computed(() => {
  return {
    'is-error': errorStatus.value !== undefined,
  }
})
defineExpose({
  hourValue,
  minsValue,
  errorStatus,
})
</script>
<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>
<style lang="postcss" scoped>
.y-table-edit-time {
  & :deep(.el-input-number) {
    width: 50px;
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
