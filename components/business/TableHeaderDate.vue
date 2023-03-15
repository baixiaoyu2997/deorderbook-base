<template>
  <div class="y-table-header-date dark" @click="stopEvent">
    <div ref="datePickerRef" class="date__input--wrap">
      <el-date-picker
        v-model="dateValue"
        type="datetimerange"
        :editable="false"
        value-format="X"
        size="small"
        prefix-icon="span"
        clear-icon="span"
        :default-time="defaultTime"
        class="date__input"
        popper-class="y-table-header-date__popper"
        @change="onPickerChange"
      ></el-date-picker>
    </div>
    <div class="date__label--wrap" @click="onLabelClick">
      <div class="date__label">DATE</div>
      <SVGDCaret
        width="17.7"
        height="17.7"
        style="margin-left: 5px"
      ></SVGDCaret>
    </div>
  </div>
</template>
<script setup lang="ts">
import { PropType } from 'vue'
import SVGDCaret from '~icons/ep/d-caret'
defineProps({
  // row: {
  //   type: Object,
  //   required: true,
  // },
  // /** 默认显示文本为table-column的label */
  // column: {
  //   type: Object,
  //   required: true,
  // },
})
const emits = defineEmits(['change'])

const stopEvent = (event: Event) => {
  // 防止设置sortable属性时点击排序
  event.stopImmediatePropagation()
}

// [ Date ]
const datePickerRef = ref(null as unknown as HTMLDivElement)
const defaultTime = ref<[Date, Date]>([
  new Date(2000, 1, 1, 0, 0, 0),
  new Date(2000, 2, 1, 23, 59, 59),
])
const dateValue = ref('')
const onPickerChange = (v: null | Date[]) => {
  emits('change', v)
}

// [ Label ]
const onLabelClick = () => {
  ;(datePickerRef.value.children[0] as any).click()
}
</script>
<style lang="postcss" scoped>
.y-table-header-date {
  position: relative;
  display: inline-block;
  & :deep(.date__input--wrap) {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    pointer-events: none;
    & .date__input {
      width: 100%;
      visibility: hidden;
    }
  }
  & .date__label--wrap {
    display: flex;
    align-items: center;
    cursor: pointer;
    & .date__label {
    }
  }
}
</style>
<style lang="postcss">
.el-table .y-table-header-date + .caret-wrapper {
  /** 隐藏排序箭头 */
  display: none;
}
.el-table__cell.is-right .y-table-header-date .date__wrap {
  justify-content: end;
}
.el-popper.y-table-header-date__popper {
  --el-bg-color-overlay: #26262b;
  padding: 8px 16px 16px;
  background-color: #26262b;
  border: 0.5px solid #4d4d4d;
  box-shadow: 0px 0px 13px rgba(0, 0, 0, 0.4);
  & .date__item {
    color: rgba(255, 255, 255, 0.3);
  }
  & .el-date-range-picker__time-header {
    /* hidden time select */
    display: none;
  }
}
</style>
