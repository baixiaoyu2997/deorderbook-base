<template>
  <div class="YFormItem" :class="labelClass" :style="labelStyle">
    <img v-if="icon" :src="icon" alt="" class="value--before" />
    <div class="value--main">{{ value }}</div>
  </div>
</template>
<script setup lang="ts">
// TODO: 组件内部使用的css变量应该唯一，并且不应插入到当前组件中，应该放到全局引入，这样方便使用时覆盖
const props = defineProps({
  height: {
    type: String,
    default: '56',
  },
  icon: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '', // 标题
  },
  value: {
    type: String,
    default: '',
  },
})
const styleObj = computed(() => {
  return {
    height: props.height + 'px',
  }
})
const { labelStyle, labelClass } = useFormLabel()
</script>
<style lang="postcss" scoped>
.YFormItem {
  position: relative;
  display: flex;
  align-items: center;
  height: v-bind('styleObj.height');
  padding: 20px 16px;
  background-color: var(--bg-lighter);
  border-radius: 4px;

  & .value--before {
    width: 32px;
    aspect-ratio: 1/1;
  }

  & .value--main {
    margin-left: 8px;
    font-size: 20px;
    font-weight: 700;
    line-height: 32px;
    color: var(--color-sub);
  }
}
</style>
