<template>
  <div class="percent__slider">
    <el-slider
      v-model="percent"
      tooltip-class="wrap__percent"
      :disabled="disabled"
      @mousedown="onFocus"
      :show-tooltip="false"
    ></el-slider>
    <div class="percent__slider__stepper_group">
      <div
        v-for="item in items"
        :key="item.value"
        v-on:click="select(item.value)"
        v-bind:class="{
          btn__percentage: true,
          active: percent >= (item.value / props.maxPercentage) * 100,
        }"
      >
        {{ item.title }}
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const emits = defineEmits(['percentChange'])

const onFocus = () => {
  propChange.value = false
}

const props = defineProps({
  color: {
    type: String,
    default: '#FFC550',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  percentProp: {
    type: Number,
    default: 0,
  },
  maxPercentage: {
    type: Number,
    default: 100,
  },
  itemNumber: {
    type: Number,
    default: 5,
  },
})

const percent = ref((props.percentProp / props.maxPercentage) * 100)

const items = computed(() => {
  const out: { title: string; value: number }[] = []
  for (let i = 0; i < props.itemNumber; i++) {
    const percentage = (i * props.maxPercentage) / (props.itemNumber - 1)
    out.push({ title: `${percentage}%`, value: percentage })
  }
  return out
})

// value eg: 25, 50, 75...
function select(value: number) {
  if (props.disabled === false) {
    percent.value = (value / props.maxPercentage) * 100
  }
}

const propChange = ref(false)
watch(percent, () => {
  if (!propChange.value) {
    emits('percentChange', (percent.value * props.maxPercentage) / 100)
  }
})

watch(
  () => props.percentProp,
  () => {
    propChange.value = true
    percent.value = props.percentProp
  }
)
</script>

<style lang="postcss" scoped>
.percent__slider {
  position: relative;
  width: 100%;

  & :deep(.el-slider__runway) {
    height: 8px;
    background: #212126;
    border-radius: 37px;
    box-shadow: inset 0px 0px 4px rgba(0, 0, 0, 0.25);

    & .el-slider__bar {
      background: #eba10f;
      border-radius: 37px;
      box-shadow: inset 0px 0px 4px rgba(0, 0, 0, 0.25);
    }

    & .el-slider__button {
      width: 18px;
      height: 18px;
      background: #eba10f;
      border: none;
      border-radius: 9px;
    }
  }

  & .percent__slider__stepper_group {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    height: 18px;

    & .btn__percentage {
      display: inline-block;
      font-family: 'Poppins';
      font-size: 14px;
      font-style: normal;
      font-weight: 500;
      line-height: 18px;

      color: #ebebf8;
      text-align: center;

      text-transform: uppercase;
      letter-spacing: 0.03em;

      cursor: pointer;
      opacity: 0.2;
    }

    & .btn__percentage.active {
      opacity: 1;
    }
  }
}
</style>
