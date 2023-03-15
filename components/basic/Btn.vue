<template>
  <el-button
    ref="elRef"
    v-bind="{ ...$attrs, ...props }"
    class="YBtn"
    :class="classObj"
  >
    <template #default>
      <slot name="default"></slot>
    </template>
  </el-button>
</template>
<script setup lang="ts">
import { buttonProps } from 'element-plus'
import type { PropType } from 'vue'
// 父组件通过ref.value.elRef.xxx调用element-ui组件方法
const elRef = ref(null)
const props = defineProps({
  ...buttonProps,
  circle: {
    type: Boolean,
    default: true,
  },
  /** 是否显示背景主题色 */
  bg: {
    type: Boolean,
    default: false,
  },
  // [ 以下为自定义属性 ]
  /** 按钮主题色 */
  colorType: {
    type: String as PropType<'blue' | 'green' | 'red' | 'grey' | 'gold'>,
    default: 'blue',
  },
  /** 按钮宽度，默认100%,不需要带px */
  width: {
    type: String,
    default: '100%',
  },
  height: {
    type: String,
    default: '50',
  },
})
// defineEmits(buttonEmits) 不要添加defineEmits，会阻断子组件触发事件
const classObj = computed(() => ({
  [`is-${props.colorType}`]: props.colorType,
  'is-block': props.block,
}))
const styleBind = computed(() => {
  return {
    width: Number(props?.width) ? `${props.width}px` : props?.width,
    height: Number(props?.height) ? `${props.height}px` : props?.height,
  }
})
</script>
<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>
<style lang="postcss" scoped>
.YBtn.el-button {
  --button-blue: #64acff;
  --button-bg-border-blue: #2463c5;
  --button-border-blue: #4098ff;
  --button-green: #32b845;
  --button-bg-border-green: #257932;
  /* --button-border-green: #4098ff; */
  --button-red: #f65046;
  --button-bg-border-red: #ba2d24;
  --button-gold: #f1e18c;
  --button-bg-border-gold: #f5be57;
  --button-grey: #212126;
  --button-bg-border-grey: #4c4c4c;

  width: v-bind('styleBind.width');
  height: v-bind('styleBind.height');
  font-weight: 600;
  background-color: transparent;

  &:hover,
  &.is-disabled {
    opacity: 0.3;
    &:hover {
      /* 禁用button时，hover的背景色 */
      background-color: unset;
    }
  }
  &.is-circle {
    border-radius: 16px;
  }

  /* 字体 */
  &:not(.el-button--small, .el-button--large) {
    font-size: 16px;
    line-height: 24px;
  }

  &.is-red {
    color: var(--button-red);
    /* border: 1px solid var(--button-border-red); */
    &.is-has-bg {
      background: linear-gradient(
        0deg,
        #c61d10 -6.13%,
        #7f1d17 23.93%,
        #510906 49.55%
      );
      border: 1px solid var(--button-bg-border-red);
    }
  }

  &.is-blue {
    color: var(--button-blue);
    border: 1px solid var(--button-border-blue);
    &.is-has-bg {
      background: linear-gradient(0deg, #0f52ba 0%, #041836 50%);
      border: 1px solid var(--button-bg-border-blue);
    }
  }

  &.is-gold {
    color: #ffffff;
    &.is-has-bg {
      background: radial-gradient(
        49.67% 49.67% at 88.76% 5.88%,
        #323232 0%,
        #26262b 95.31%
      );
      border: 1px solid var(--button-bg-border-gold);
    }
  }

  &.is-green {
    color: var(--button-green);
    /* border: 1px solid var(--button-border-green); */
    &.is-has-bg {
      background: linear-gradient(
        0deg,
        #13651f 0%,
        #07310d 60.94%,
        #042108 100%
      );
      border: 1px solid var(--button-bg-border-green);
    }
  }
  &.is-grey {
    color: #fff;
    /* border: 1px solid var(--button-border-green); */
    &.is-has-bg {
      background: var(--button-grey);
      border: 1px solid var(--button-bg-border-grey);
    }
  }
}
.el-button + .el-button {
  margin-left: 0; /* 删除挨着的button的间距 */
}
</style>
