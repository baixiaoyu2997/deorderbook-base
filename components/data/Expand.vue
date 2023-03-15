<template>
  <div class="y-expand">
    <div class="y-expand__content">
      <Transition>
        <template v-if="isExpanded">
          <slot></slot>
        </template>
      </Transition>
    </div>
    <div class="toggle__button" @click="isExpanded = !isExpanded">
      <span>Show {{ isExpanded ? 'Less' : 'More' }}</span>
      <el-icon :size="10" class="button__icon"><arrow-down-bold /></el-icon>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ArrowDownBold } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})
const emits = defineEmits(['update:modelValue'])

const isExpanded = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emits('update:modelValue', value)
  },
})

const styleObj = computed(() => {
  return {
    blockMaxHeight: isExpanded.value ? 'auto' : 0,
    iconRotate: isExpanded.value ? 'rotate(180deg)' : 'rotate(0)',
  }
})
</script>
<style lang="postcss" scoped>
.v-enter-active,
.v-leave-active {
  transition: max-height 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  max-height: 0;
}

.v-enter-to,
.v-leave-from {
  max-height: 100vh;
}

.y-expand {
  & .y-expand__content {
    height: auto;
    overflow: hidden;
  }

  & .toggle__button {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 27px;
    margin-top: 12px;
    font-size: 12px;
    line-height: 16px;
    text-align: center;
    cursor: pointer;

    & span {
      text-decoration: underline;
    }

    & .button__icon {
      margin-left: 6px;
      transform: v-bind('styleObj.iconRotate');
    }
  }
}
</style>
