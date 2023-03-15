<template>
  <div class="y-slider">
    <div class="slider__tooltip">{{ tooltip }}</div>
    <el-slider
      ref="elRef"
      :disabled="disabled"
      v-bind="{ ...$attrs, ...props }"
      :marks="marks"
    ></el-slider>
  </div>
</template>
<script setup lang="ts">
import { Big } from 'big.js'
import type { CSSProperties, PropType } from 'vue'
import { TokenSymbols } from '~/composables/useTokens'
const elRef = ref(null)
const props = defineProps({
  modelValue: {
    type: Number,
    default: 50,
  },
  showTooltip: {
    type: Boolean,
    default: false,
  },
  // [ 自定义属性 ]
  /** slider条上边显示total和token */
  showValue: {
    type: Boolean,
    default: true,
  },
  token: {
    type: String as PropType<TokenSymbols | 'SNIPER' | 'BULLET'>,
    required: true,
  },
  total: {
    type: String,
    default: '',
  },
})
const disabled = computed(() => {
  return props.total === '0'
})
interface Mark {
  style: CSSProperties
  label: string
}
type Marks = Record<number, Mark | string>
const marks = computed<Marks>(() => {
  return {
    0: '0%',
    25: {
      style: {
        opacity: props.modelValue < 25 ? '0.2' : '1',
      },
      label: '25%',
    },
    50: {
      style: {
        opacity: props.modelValue < 50 ? '0.2' : '1',
      },
      label: '50%',
    },
    75: {
      style: {
        opacity: props.modelValue < 75 ? '0.2' : '1',
      },
      label: '75%',
    },
    100: {
      style: {
        opacity: props.modelValue < 100 ? '0.2' : '1',
      },
      label: '100%',
    },
  }
})
const tooltip = computed(() => {
  return (
    useTokenNumberFormat(
      Big(props.total).times(props.modelValue).div(100).toFixed(),
      { token: props.token }
    ) +
    ' ' +
    props.token
  )
})
// defineEmits(buttonEmits) 不要添加defineEmits，会阻断子组件触发事件
</script>
<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>
<style lang="postcss" scoped>
.y-slider {
  position: relative;
  height: 71px;
  padding-top: 26px;
  & .el-slider {
    --el-slider-main-bg-color: #ffc550;
    --el-slider-runway-bg-color: #212126;
    --el-slider-stop-bg-color: transparent;
    --el-slider-border-radius: 37px;
    --el-slider-height: 8.18px;
    --el-slider-button-size: 22.89px;
    --el-color-white: #ffc550; /* 修改圆点颜色 */
    & :deep(.el-slider__marks) {
    }
    & :deep(.el-slider__marks-text) {
      color: #fff; /** 百分比文字颜色 */
      &:first-child {
        left: 3% !important; /** 修改百分比文字左对齐位置 */
      }
      &:last-child {
        /** 修改百分比文字右对齐位置 */
        right: -5%;
        left: 96% !important;
      }
    }
    & :deep(.el-slider__runway) {
      box-shadow: inset 0px 0px 4px rgba(0, 0, 0, 0.25);
    }
  }
  & .slider__tooltip {
    position: absolute;
    top: 0;
    left: 50%;
    font-size: 16px;
    font-weight: 600;
    line-height: 18px;
    color: #ffc550;
    transform: translate(-50%, 0);
  }
}
</style>
