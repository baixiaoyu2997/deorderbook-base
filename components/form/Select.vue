<template>
  <el-select
    ref="elRef"
    v-bind="{ ...$attrs, ...props }"
    class="y-select"
    :class="classObj"
    :style="labelStyle"
  >
    <template v-if="props.icon || $slots.prefix" #prefix>
      <img v-if="props.icon" :src="props.icon" alt="" class="select--prefix" />
      <div v-else>
        <slot name="prefix"></slot>
      </div>
    </template>
    <template #default>
      <slot name="default"></slot>
    </template>
  </el-select>
</template>
<script setup lang="ts">
// 父组件通过ref.value.elRef.xxx调用element-ui组件方法
const elRef = ref(null as any)
const props = defineProps({
  label: {
    type: String,
    default: '', // 标题
  },
  placeholder: {
    type: String,
    default: '--',
  },
  icon: {
    type: String,
    default: '', // icon链接
  },
  effect: {
    type: String,
    default: 'dark',
  },
  alignCenter: Boolean, // 居中显示select值
  popperClass: {
    type: String,
    default: 'y-select__popper',
  },
  // [ 以下为自定义属性 ]
  height: String,
  width: String,
  borderRadius: String,
  readonly: {
    type: Boolean,
    default: false,
  },
})
const { labelStyle, labelClass } = useFormLabel()
const classObj = reactive({
  'align-center': props.alignCenter,
  'y-select--readonly': props.readonly,
  ...labelClass.value,
})
onMounted(() => {
  // 禁用键盘tab切换到select
  if (props.readonly && elRef.value !== null) {
    elRef.value.$.subTree.el
      .getElementsByClassName('el-input__inner')[0]
      .setAttribute('tabindex', -1)
  }
})
const selectWidth = computed(() =>
  props.width ? `${Number(props.width)}px` : '100%'
)
const selectHeight = computed(() =>
  props.height ? `${Number(props.height)}px` : '36px'
)
const selectBorderRadius = computed(() =>
  props.borderRadius ? `${Number(props.borderRadius)}px` : ''
)
</script>
<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>
<style lang="postcss" scoped>
.y-select.el-select {
  &:hover {
    & .el-input__wrapper {
      box-shadow: none; /** 删除无用样式 */
    }
  }
  & :deep(.el-input.is-disabled .el-input__inner) {
    opacity: 0.2; /* 禁用时select font color */
  }
  & :deep(.is-disabled .el-input__suffix .el-icon) {
    color: #535353; /* 禁用时select arrow color */
  }
  & :deep(.el-input.is-disabled .el-input__wrapper) {
    background: #212126; /* 禁用时select背景色 */
    box-shadow: inset 0px 0px 6px #141414;
  }
  & :deep(.el-input.is-disabled .el-input__wrapper:hover) {
    box-shadow: inset 0px 0px 6px #141414; /* 禁用时select hover shadow */
  }
  & :deep(.el-input.is-focus .el-input__wrapper) {
    border: 0.5px solid #ffffff; /** 选中时select边框颜色 */
    box-shadow: inset 0px 0px 9px rgba(0, 0, 0, 0.44) inset !important; /* 弹出下拉菜单时，input边框颜色 */
  }
  & :deep(.el-input__wrapper.is-focus) {
    box-shadow: none !important; /** 选取值后select边框样式 */
  }

  & :deep(.el-input) {
    width: v-bind('selectWidth');
    height: v-bind('selectHeight');
  }
  & :deep(.el-input__wrapper) {
    padding: 6px 8px; /* 选择框内部间距 */

    background-color: #26262b; /* 选择框背景色 */
    border: 0.5px solid #777777;
    border-radius: v-bind('selectBorderRadius');
    box-shadow: none; /** 删除默认shadow边框样式 */
    &:hover {
      box-shadow: none; /** 删除hover shadow边框样式 */
    }
  }
  &.align-center :deep(input) {
    text-align: center;
  }

  & :deep(.el-input__prefix) {
    display: flex;
    align-items: center;
    /* prefix图片间距 */
    & .el-input__prefix-inner > :last-child {
      margin-right: 0px;
      font-size: 16px;
      font-weight: 500;
      line-height: 19px;
      color: #ffffff;
      & img {
        margin-right: 8px;
      }
    }
  }
  & :deep(.el-input__suffix) {
    /* 选择框箭头 */
    & .el-icon {
      color: #b1b1b1;
    }
    & .el-icon svg {
      width: 1.15em;
      height: 1.15em;
    }
    & .el-input__suffix-inner > :first-child {
      margin-left: 0; /* 箭头向左的边距 */
    }
  }
  & :deep(.el-input__inner) {
    /* 输入框字体 */
    font-size: 16px;
    font-weight: 600;
    line-height: 20px;
  }
  /* prefix 图片大小 */
  & .select--prefix {
    width: 24px;
    height: 24px;
  }
  /* 自定义样式：禁止选则select */
  &.y-select--readonly {
    pointer-events: none;

    & :deep(.el-input__wrapper) {
      pointer-events: none;
    }
    & :deep(.el-input .el-select__caret) {
      pointer-events: none;
    }
    & :deep(.el-input__prefix-inner) {
      pointer-events: none;
    }
    & :deep(.el-input__suffix) {
      visibility: hidden;
    }
  }
}
:global(.y-select__popper .el-popper__arrow::before) {
  /* 清除顶部arrow */
  content: none;
  background: transparent !important;
  border: none !important;
}
:global(.el-popper.el-select__popper.earlier-select) {
  background: #212121;
  border: 1px solid #212121;
  border-radius: 4px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.25);
}

:global(.el-select-dropdown__list > .el-select-dropdown__item.hover) {
  color: #00df9a;
  background-color: transparent;
}
:global(.el-select-dropdown__list > .el-select-dropdown__item.selected) {
  color: #00df9a;
}
:global(.y-select__popper.el-popper.is-dark) {
  background-color: #26262b; /* 弹窗背景色 */
  border: 0.5px solid #777777; /* 弹窗border */
  border-radius: 16px; /* 弹窗border-radius */
  box-shadow: 0px 0px 9px rgba(0, 0, 0, 0.4); /* 弹窗shadow */
}
:global(.y-select__popper .el-select-dropdown__item) {
  display: flex;
  align-items: center;
  padding: 0 8px; /* 弹出框左右间距 */
  font-size: 16px;
  font-weight: 600;
  line-height: 20px;
}
:global(.y-select__popper .el-select-dropdown__item > div) {
  opacity: 0.6; /* option font color */
}
:global(.y-select__popper .el-select-dropdown__item img) {
  width: 24px;
  height: 24px; /* 为插槽图片添加宽高 */
  margin-right: 8px;
}
:global(.y-select__popper .el-select-dropdown__item.hover) {
  background-color: unset; /* option hover背景色 */
}
:global(.y-select__popper .el-select-dropdown__item.selected) {
  font-weight: 600;
  color: unset; /* 选中项hover背景色 */
}
:global(.y-select__popper .el-select-dropdown__list) {
  margin: 8px 0 !important; /* 弹出框内部上下间距 */
}
</style>
