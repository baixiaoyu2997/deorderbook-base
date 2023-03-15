<template>
  <div class="y-count">
    <slot name="prefix" :is-pause="isActive"></slot>
    <div v-if="isActive">{{ dateLabel }}</div>
    <div v-else>
      <slot name="end">0</slot>
    </div>
    <slot name="suffix"></slot>
  </div>
</template>
<script setup lang="ts">
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration.js'
dayjs.extend(duration)

const props = defineProps({
  timestamp: {
    type: Number,
    default: 0,
  },
  customTime: {
    type: Number,
    default: 0,
  },
  dayFormat: {
    type: String,
    default: '',
  },
  hourFormat: {
    type: String,
    default: '',
  },
})
const emits = defineEmits(['pause', 'customPause'])
const dateLabel = ref('')

// 倒计时
const { pause, isActive } = useIntervalFn(
  () => {
    const countDown = props.timestamp - Date.now()
    if (countDown <= 0) {
      setTimeout(() => {
        // 放在setTimeout中是为了防止未初始化就执行pause,导致错误
        pause()
        emits('pause')
      })
    } else {
      if (props.customTime && countDown < props.customTime) {
        emits('customPause')
      }
      const duration = dayjs.duration(countDown)
      let formatType =
        (duration.$d.days || duration.$d.months) > 0
          ? props.dayFormat
          : props.hourFormat
      if (duration.$d.months > 0) {
        // duration内部days有上限，months存在时将months化为day
        // 传入格式 D[Day] H[Hour]  或者  D[d] H[h]， split切割判断 Hour 还是 h
        // 最后format，hour逻辑不变，day用传入字符串【10Day】

        const day = Math.trunc(duration.asDays())
        const splitSpace = formatType.split(' ')

        let dayLabel = 'Days'
        let hourType = 'H'
        let hourLabel = 'Hours'
        if (splitSpace.length < 3) {
          // 传入格式 D[Days] H[Hours]
          hourType = splitSpace[1][0]
          hourLabel = splitSpace[1].slice(2, -1)
          dayLabel = splitSpace[0].slice(2, -1)
          if (dayLabel === 'Days' && day <= 1) {
            dayLabel = 'Day'
          }
          formatType = `[${day}${dayLabel}] ${hourType}[${hourLabel}]`
        } else {
          // 传入格式 D [Days] H [Hours]
          hourType = splitSpace[2]
          hourLabel = splitSpace[3].slice(1, -1)
          if (dayLabel === 'Days' && day <= 1) {
            dayLabel = 'Day'
          }
          formatType = `[${day} ${dayLabel}] ${hourType} [${hourLabel}]`
        }
      }
      dateLabel.value = duration.format(formatType)
    }
  },
  1000,
  { immediateCallback: true }
)
</script>
<style lang="postcss" scoped>
.y-count {
  display: flex;
  align-items: center;
}
</style>
