<template>
  <div
    class="y-address-copy"
    :style="styleObj"
    @click="($event) => onClickCopy($event)"
  >
    <div class="address__value--format" :class="formatValueClass">
      {{ formatAddress }}
    </div>
    <div ref="addressRef" class="address__value">{{ address }}</div>
    <SVGCopy
      class="svg__copy"
      :width="iconSize"
      :height="iconSize"
      :color="iconColor"
    ></SVGCopy>
  </div>
</template>
<script setup lang="ts">
import SVGCopy from '~icons/lucide/copy'
/**
 * support copy address and ens
 */
const props = defineProps({
  address: {
    type: String,
    required: true,
  },
  /**
   * address opacity
   */
  opacity: {
    type: Number,
    default: 1,
  },
  /**
   * show address underline
   */
  underline: {
    type: Boolean,
    default: true,
  },
  /**
   * address font size
   */
  textSize: {
    type: String as PropType<'default' | 'small'>,
    default: 'default',
  },
  iconSize: {
    type: Number,
    default: 16,
  },
  iconColor: {
    type: String,
    default: 'rgba(255,255,255,0.4)',
  },
  /**
   * use ellipsis
   */
  ellipsis: {
    type: Boolean,
    default: false,
  },
  /**
   * enable ens
   */
  ens: {
    type: Boolean,
    default: false,
  },
  /**
   * handle click event, same as Event.stopPropagation()
   */
  stopPropagation: {
    type: Boolean,
    default: false,
  },
})

const formatValueClass = computed(() => {
  return {
    'is-underline': props.underline,
  }
})
const { lookupAddress } = useENS()
const addressRef = ref(null as unknown as HTMLDivElement)
const formatAddress = computed(() => {
  let formatString = props.address
  if (props.ellipsis) {
    formatString = (props.address as string).substring(0, 8) + '...'
  }
  if (props.ens && props.address) {
    formatString = lookupAddress(props.address).value.state || formatString
  }
  return formatString
})
const { copy } = useCopyText()
const onClickCopy = (e: Event) => {
  if (props.stopPropagation) {
    e.stopPropagation()
  }
  copy(addressRef.value)
}

// [ size ]
const styleObj = computed(() => {
  return props.textSize === 'small'
    ? { fontSize: '14px', lineHeight: '18px', fontWeight: 400 }
    : { fontSize: '16px', lineHeight: '20px', fontWeight: 600 }
})
</script>
<style lang="postcss" scoped>
.y-address-copy {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  & .address__value--format {
    opacity: v-bind('props.opacity');
    &.is-underline {
      text-decoration: underline;
    }
  }
  & .address__value {
    position: absolute;
    top: -99999999px;
    left: -99999999px;
    z-index: -1;
  }
  & .svg__copy {
    margin-left: 4px;
  }
}
</style>
