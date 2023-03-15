<template>
  <div class="y-table-header-filter" @click="stopEvent">
    <el-popover
      v-model:visible="popoverVisible"
      placement="bottom"
      :width="200"
      :show-arrow="false"
      effect="dark"
      popper-class="y-table-header-filter__popper"
      trigger="click"
      @before-leave="onPopoverHide"
    >
      <template #reference>
        <div class="filter__wrap">
          <slot name="default">{{ column.label }}</slot>
          <SVGDCaret
            width="17.7"
            height="17.7"
            style="margin-left: 5px"
          ></SVGDCaret>
        </div>
      </template>
      <el-checkbox-group v-model="checkList" size="large">
        <div v-for="item in options" :key="item.label">
          <el-checkbox :label="item.value" class="filter__item">
            {{ item.label }}
          </el-checkbox>
        </div>
      </el-checkbox-group>
      <div class="button__reset" @click="resetCheckList">Clear</div>
    </el-popover>
  </div>
</template>
<script setup lang="ts">
import { PropType } from 'vue'
import SVGDCaret from '~icons/ep/d-caret'
defineProps({
  row: {
    type: Object,
    required: true,
  },
  /** 默认显示文本为table-column的label */
  column: {
    type: Object,
    required: true,
  },
  /** 勾选项列表 */
  options: {
    type: Array as PropType<{ label: string; value: string }[]>,
    required: true,
  },
})
const emits = defineEmits(['hide', 'change'])

// 防止设置sortable属性时点击排序
const stopEvent = (event: Event) => {
  event.stopImmediatePropagation()
}

// [ CheckBox ]
const oldCheckList = ref([] as string[])
const checkList = ref([] as string[])
const resetCheckList = () => {
  checkList.value = []
  popoverVisible.value = false
}

// [ Popover ]
const popoverVisible = ref(false)
// if value changed, emit change event
watch(popoverVisible, (visible) => {
  if (visible) {
    oldCheckList.value = checkList.value
  } else if (
    JSON.stringify(oldCheckList.value.sort()) !==
    JSON.stringify(checkList.value.sort())
  ) {
    emits('change', checkList.value)
  }
})
const onPopoverHide = () => {
  emits('hide', checkList.value)
}
</script>
<style lang="postcss" scoped>
.y-table-header-filter {
  & .filter__wrap {
    display: inline-flex;
    align-items: center;
  }
}
</style>
<style lang="postcss">
.el-table .y-table-header-filter + .caret-wrapper {
  /** 隐藏排序箭头 */
  display: none;
}
.el-table__cell.is-right .y-table-header-filter .filter__wrap {
  justify-content: end;
}
.el-popper.el-popover.y-table-header-filter__popper {
  padding: 8px 16px 16px;
  background-color: #26262b;
  border: 0.5px solid #4d4d4d;
  box-shadow: 0px 0px 13px rgba(0, 0, 0, 0.4);
  & .el-checkbox__inner {
    /* checkbox背景颜色 */
    --el-checkbox-bg-color: #26262b;
    --el-checkbox-input-border: 1px solid rgba(255, 255, 255, 0.3);
    --el-checkbox-border-radius: 4px;
  }
  & .button__reset {
    display: inline-block;
    margin-top: 8px;
    font-size: 11px;
    line-height: 18px;
    color: #ffffff;
    text-decoration: underline;
    cursor: pointer;
    opacity: 0.6;
  }
  & .filter__item {
    color: rgba(255, 255, 255, 0.3);
  }
}
</style>
