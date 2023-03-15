<template>
  <div class="wrap__chart" ref="elRef" v-bind="{ ...$attrs, ...props }">
    <canvas ref="canvasRef" v-bind:style="{ width: width + 'px' }" />
    <div class="wrap__legend">
      <div
        class="txt__legend"
        v-for="item in items"
        :key="item.name"
        v-bind:style="{ color: item.color }"
      >
        {{ item.name }}
      </div>
    </div>
    <div class="txt__title">{{ title }}</div>
  </div>
</template>
<script setup lang="ts">
import { buttonProps } from 'element-plus'
import { onMounted } from 'vue'

interface ChartItem {
  name: string
  color: string
  percent: number
}

const props = defineProps({
  ...buttonProps,
  title: {
    type: String,
    default: '',
  },
  items: {
    type: Array,
    required: true,
  },
  width: {
    type: Number,
    require: true,
  },
  lineWidth: {
    type: Number,
    default: 60,
  },
})

watch(
  () => [props.items],
  () => {
    renderCanvas()
  }
)

const canvasRef = ref(null as unknown as HTMLCanvasElement)

onMounted(() => {
  renderCanvas()
})

function renderCanvas() {
  const canvasWidth = props.width
  const radius = canvasWidth! - props.lineWidth! / 2
  const canvasHeight =
    canvasWidth! / 2 + radius * Math.sin(Math.PI / 8) - props.lineWidth / 3
  const canvas = canvasRef.value
  canvas.width = canvasWidth!
  canvas.height = canvasHeight
  canvas.style.width = canvas.width + 'px'
  canvas.style.height = canvas.height + 'px'
  canvas.width = canvas.width * 2
  canvas.height = canvas.height * 2
  if (canvas) {
    const ctx = canvas.getContext('2d')
    if (ctx) {
      let startAngle = (-Math.PI * 9) / 8
      for (const index in props.items) {
        const item = props.items[index] as unknown as ChartItem
        const centerX = canvas.width / 2
        const centerY = radius + props.lineWidth / 2
        ctx.beginPath()
        const paddingAngle =
          Math.PI / 72 + Math.sin(props.lineWidth! / 2 / radius) * 2
        if (item.percent < 0.01) {
          item.percent = 0
        }
        const endAngle =
          startAngle +
          ((Math.PI * 10) / 8 - paddingAngle * (props.items.length - 1)) *
            item.percent
        ctx.arc(centerX, centerY, radius, startAngle, endAngle)
        ctx.lineWidth = props.lineWidth
        ctx.strokeStyle = item.color
        ctx.lineCap = 'round'
        ctx.stroke()
        ctx.closePath()
        ctx.save()
        startAngle = endAngle + paddingAngle
      }
    }
  }
}
</script>

<style lang="postcss" scoped>
.wrap__chart {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-content: center;
  text-align: center;

  & canvas {
    margin: auto;
  }

  & .txt__title {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    margin-top: 13px;
    font-family: 'Poppins';
    font-size: 26px;
    font-style: normal;
    font-weight: 600;
    line-height: 100%;
    color: #ffffff;
    text-align: center;
  }

  & .wrap__legend {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 16px;
    align-content: center;
    justify-content: center;
    margin: 0 30px;

    font-family: 'Poppins';
    font-size: 14px;
    font-style: normal;
    font-weight: 600;
    line-height: 18px;
    text-align: left;

    & .txt__legend {
      display: inline-block;

      &::before {
        margin-right: 8px;
        content: '●';
      }
    }
  }
}
</style>
