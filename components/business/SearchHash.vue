<template>
  <div class="y-search-hash">
    <y-input
      ref="elRef"
      :model-value="modelValue"
      :height="height"
      size="large"
      placeholder="ENS Name / Wallet Address / Transaction Hash"
      @update:model-value="onInputUpdate"
      @keyup.enter="onKeyEnter"
    >
      <template #prefix>
        <SVGSearch style="opacity: 0.4"></SVGSearch>
      </template>
    </y-input>
  </div>
</template>
<script setup lang="ts">
import { utils } from 'ethers'
import SVGSearch from '~icons/heroicons-outline/search'
// 父组件通过ref.value.elRef.xxx调用element-ui组件方法
const elRef = ref(null)
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  height: {
    type: String,
    default: '52',
  },
  width: {
    type: String,
    default: '800',
  },
})
const emits = defineEmits(['update:model-value'])

const onKeyEnter = () => {
  const hash = props.modelValue
  const isAddress = utils.isAddress(hash)
  emits('update:model-value', '') // clean input value
  if (isAddress) {
    return navigateTo(`/address/${hash}`)
  } else if (hash.includes('.')) {
    // ens name
    const { show, hide } = useLoading()
    show()
    const { resolveName } = useENS()
    const { state, isReady } = toRefs(resolveName(hash).value)
    watchOnce(isReady, () => {
      if (isReady.value) {
        hide()
        return navigateTo(`/address/${state.value}`)
      }
    })
  } else {
    return navigateTo(`/tx/${hash}`)
  }
}
const onInputUpdate = (v: string) => {
  emits('update:model-value', v)
}
</script>
<style lang="postcss" scoped>
.y-search-hash {
  width: v-bind('props.width+"px"');
  & :deep(.has-prefix .el-input__wrapper) {
    padding: 0 16px;
    background-color: #151515;
    border: 1px solid #646464;
    border-radius: 30px;
    box-shadow: unset;
    & input {
      font-size: 16px;
      font-weight: 500;
    }
    & input::placeholder {
      font-size: 16px;
      font-weight: 500;
      color: #646464;
    }
  }
}
</style>
