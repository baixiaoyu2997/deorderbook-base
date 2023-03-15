<template>
  <span class="y-button" :class="buttonClass">
    <el-button @click="click">
      <slot></slot>
    </el-button>
  </span>
</template>
<script setup lang="ts">
const props = defineProps({
  block: {
    default: false,
    type: Boolean,
  },
  dark: {
    default: false,
    type: Boolean,
  },
  green: {
    default: false,
    type: Boolean,
  },
  red: {
    default: false,
    type: Boolean,
  },
  light: {
    default: false,
    type: Boolean,
  },
  disabled: {
    default: false,
    type: Boolean,
  },
  border: {
    default: false,
    type: Boolean,
  },
})
const buttonClass = ref([])
const classes = ['dark', 'green', 'block', 'light', 'red', 'disabled', 'border']
for (const i in props) {
  if (classes.includes(i) && props[i]) {
    buttonClass.value.push(i)
  }
}

const emits = defineEmits(['click'])
const click = () => {
  emits('click')
}

watch(
  () => props,
  () => {
    buttonClass.value = []
    for (const i in props) {
      if (classes.includes(i) && props[i]) {
        buttonClass.value.push(i)
      }
    }
  },
  { deep: true }
)
</script>

<style lang="postcss" scoped>
.y-button {
  display: inline-block;
  height: 44px;

  & :deep(.el-button) {
    width: 100%;
    height: 100%;
    padding: 0 12px;
    font-size: 16px;
    font-weight: 500;
    line-height: 22px;
    color: #1b1b1b;
    background: var(--gradient);
    border: none;
    border-radius: 4px;

    &:hover,
    &:focus {
      color: #1b1b1b;
      background-color: var(--gradient);
      border: none;
      opacity: 0.6;
    }

    &:focus {
      opacity: 1;
    }
  }

  &.title-dot {
    &.active {
      & :deep(.el-button) {
        & span {
          position: relative;
        }
      }
    }

    & :deep(.el-button) {
      & span {
        position: relative;

        &::after {
          position: absolute;
          top: 0;
          right: -10px;
          width: 10px;
          height: 10px;
          content: '';
          background-color: rgb(255 97 97 / 100%);
          border: 2px solid #222;
          border-radius: 50%;
        }
      }
    }
  }

  &.disabled {
    cursor: not-allowed;

    & :deep(.el-button) {
      pointer-events: none;
      opacity: 0.4;
    }
  }

  &.block {
    display: block;
    width: 100%;
    height: 44px;

    & :deep(.el-button) {
      display: block;
      width: 100%;
    }
  }

  &.dark {
    & :deep(.el-button) {
      color: white !important;
      background: var(--disabled-bg) !important;
    }
  }

  &.border {
    border: 1px solid var(--color-primary);
    border-radius: 4px;
  }

  &.green {
    & :deep(.el-button) {
      background: #00df9a;
    }

    &.light.y-button {
      height: 40px;
      background: linear-gradient(
        135deg,
        rgb(0 223 154 / 12%) 0%,
        rgb(74 168 255 / 12%) 100%
      );
      border-radius: 4px;

      & .el-button {
        background: linear-gradient(135deg, #00df9a 0%, #4aa8ff 100%);
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }
  }

  &.red {
    & :deep(.el-button) {
      background: linear-gradient(135deg, #f758a4 0%, #ff6161 100%);
    }
  }

  &.brown {
    & :deep(.el-button) {
      background: #f89248;
    }

    &.light:deep(.el-button) {
      color: #f89248;
      background-color: rgba(248, 146, 72, 10%);
    }
  }

  &.blue {
    & :deep(.el-button) {
      background: #0dc5ed;
    }

    &.light:deep(.el-button) {
      color: #0dc5ed;
      background-color: rgba(13, 197, 237, 10%);
    }
  }

  &.light {
    & :deep(.el-button) {
      box-sizing: border-box;
      padding: 1px;
      border: none;
      border-radius: 4px;
    }
  }
}
</style>
