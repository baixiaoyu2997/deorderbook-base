<template>
  <div class="y-table-header-sort" @click="stopEvent">
    <el-popover
      v-model:visible="popoverVisible"
      placement="bottom"
      :width="200"
      :show-arrow="false"
      effect="dark"
      popper-class="y-table-header-sort__popper"
      trigger="click"
      @before-leave="onPopoverHide"
    >
      <template #reference>
        <div class="filter__wrap">
          <slot name="default">{{ column.label }}</slot>
          <span class="caret-wrapper" :class="currentSelect">
            <i class="sort-caret ascending"></i>
            <i class="sort-caret descending"></i>
          </span>
        </div>
      </template>
      <div
        v-for="item in options"
        :key="item.label"
        :label="item.value"
        class="sort__item"
        @click="() => onSelectSort(item)"
      >
        <SVGArrowUp v-if="item.value === 'ascending'"></SVGArrowUp>
        <SVGArrowDown v-else></SVGArrowDown>
        <div class="item__label">{{ item.label }}</div>
      </div>
      <div class="button__reset" @click="resetSelect">Clear</div>
    </el-popover>
  </div>
</template>
<script setup lang="ts">
import { PropType } from 'vue'
import SVGArrowUp from '~icons/lucide/arrow-up'
import SVGArrowDown from '~icons/lucide/arrow-down'
const props = defineProps({
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
    default: () => [
      { label: 'Sort Low to High', value: 'ascending' },
      { label: 'Sort High to Low', value: 'descending' },
    ],
  },
})
const emits = defineEmits(['hide', 'change'])

// 防止设置sortable属性时点击排序
const stopEvent = (event: Event) => {
  event.stopImmediatePropagation()
}

// [ CheckBox ]
const currentSelect = ref(null)
const onSelectSort = (item: any) => {
  currentSelect.value = item.value
  popoverVisible.value = false
}
const oldSelect = ref(null)

const resetSelect = () => {
  currentSelect.value = null
  popoverVisible.value = false
}

// [ Popover ]
const popoverVisible = ref(false)
// if value changed, emit change event
watch(popoverVisible, (visible) => {
  if (visible) {
    oldSelect.value = currentSelect.value
  } else if (
    JSON.stringify(oldSelect.value) !== JSON.stringify(currentSelect.value)
  ) {
    emits('change', {
      prop: props.column.property,
      order: currentSelect.value,
    })
  }
})
const onPopoverHide = () => {
  emits('hide', currentSelect)
}
</script>
<style lang="postcss" scoped>
.y-table-header-sort {
  & .filter__wrap {
    display: inline-flex;
    align-items: center;
  }
}
</style>
<style lang="postcss">
.el-table .y-table-header-sort + .caret-wrapper {
  /** 隐藏排序箭头 */
  display: none;
}
.el-table__cell.is-right .y-table-header-sort .filter__wrap {
  justify-content: end;
}
.el-popper.el-popover.y-table-header-sort__popper {
  padding: 16px;
  background-color: #26262b;
  border: 0.5px solid #4d4d4d;
  box-shadow: 0px 0px 13px rgba(0, 0, 0, 0.4);
  & .sort__item {
    display: flex;
    align-items: center;
    height: 18px;
    font-size: 12px;
    line-height: 18px;

    color: #ffffff;
    cursor: pointer;

    opacity: 0.3;

    &:not(:first-child) {
      margin-top: 16px;
    }
    & .item__label {
      margin-left: 8px;
    }
  }
  & .button__reset {
    display: inline-block;
    margin-top: 16px;
    font-size: 11px;
    line-height: 18px;
    color: #ffffff;
    text-decoration: underline;
    cursor: pointer;
    opacity: 0.6;
  }
}
</style>
