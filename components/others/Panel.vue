<template>
  <div ref="elRef" v-bind="{ ...$attrs, ...props }" class="y-panel">
    <div class="panel__header">
      <div class="header__title" :style="titleStyleObj">
        <div class="title__icon">
          <slot name="title-prefix"></slot>
        </div>
        <div class="title">{{ props.title }}</div>
        <div class="title__icon">
          <slot name="title-suffix"></slot>
        </div>
      </div>
    </div>
    <div class="panel__body">
      <slot name="default"></slot>
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  titleAlign: {
    type: String,
    default: 'left',
  },
})
const titleStyleEnum = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
}
const titleStyleObj = computed(() => {
  return {
    'justify-content': titleStyleEnum[props.titleAlign],
  }
})
// 父组件通过ref.value.elRef.xxx调用element-ui组件方法
const elRef = ref(null)
</script>
<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>
<style lang="postcss" scoped>
.y-panel {
  position: relative;
  background: rgb(40 40 40 / 60%);
  border-radius: 8px;

  & .panel__header {
    display: flex;
    align-items: center;
    padding: 20px 22px 20px 20px;
    border-bottom: 1px solid rgb(255 255 255 / 10%);

    & .header__title {
      display: flex;
      flex: 1;
      align-items: center;
      font-size: 20px;
      font-weight: bold;
      line-height: 26px;

      & .title__icon {
        display: flex;
        align-items: center;

        & :deep(img) {
          width: 24px;
          height: 24px;
          border-radius: 50%;
        }

        & + .title {
          margin-left: 12px;
        }
      }

      & .title {
        & + .title__icon {
          & :deep(img) {
            width: 16px;
            height: 16px;
            margin-left: 12px;
          }
        }
      }
    }
  }

  & .panel__body {
    padding: 20px;
  }
}
</style>
