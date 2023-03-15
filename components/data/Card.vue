<template>
  <el-card ref="elRef" v-bind="{ ...$attrs, ...props }" class="YCard">
    <template v-if="slots.header" #header>
      <slot name="header"></slot>
    </template>
    <template #default>
      <slot name="default"></slot>
    </template>
  </el-card>
</template>
<script setup lang="ts">
import type { CardProps } from 'element-plus'
import { cardProps } from 'element-plus'
import { PropType } from 'vue'
const slots = useSlots()

// 父组件通过ref.value.elRef.xxx调用element-ui组件方法
const elRef = ref(null)
const props = defineProps({
  ...cardProps,
  /** card-body默认样式 */
  bodyStyle: {
    type: Object as PropType<CardProps['bodyStyle']>,
    default: () => ({ padding: '0 24px 16px' }),
  },
  shadow: {
    type: String as PropType<CardProps['shadow']>,
    default: 'never',
  },
  // [ 以下为自定义属性 ]
  /** header是否居中，默认为false */
  headerCenter: {
    type: Boolean,
    default: false,
  },
})
const { headerCenter, ...elProps } = toRefs(props)
// defineEmits(buttonEmits) 不要添加defineEmits，会阻断子组件触发事件
</script>
<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>
<style lang="postcss" scoped>
.YCard.el-card {
  color: var(--color);
  background: radial-gradient(
    49.67% 49.67% at 88.76% 5.88%,
    #323232 0%,
    #26262b 95.31%
  );
  border: 0.5px solid #4d4d4d;
  border-radius: 16px;
  & :deep(.el-card__header) {
    /* header 默认padding */
    padding: 24px 32px 16px 32px;
    font-size: 20px;
    font-weight: 600;
    line-height: 30px;
    text-align: v-bind('headerCenter?"center":""');
    border: none;
  }
}
</style>
