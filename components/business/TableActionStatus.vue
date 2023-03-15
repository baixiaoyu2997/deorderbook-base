<template>
  <div
    class="table-action-status"
    :class="[
      status,
      hasHODLRewards ? 'hasHODLRewards' : '',
      `is-${props.type}`,
    ]"
  >
    <div class="status__countdown">{{ countdown }}</div>
    <div v-if="status !== 'startedCollect'" class="status__chart">
      <el-tooltip
        effect="dark"
        content="Lock Period starts"
        placement="bottom"
        popper-class="y-tooltip"
      >
        <SVGLock class="chart__lock--start"></SVGLock>
      </el-tooltip>
      <el-progress
        :stroke-width="13.3"
        :percentage="exercisePercentage"
        :show-text="false"
        class="chart__countdown-progress"
      />
      <el-tooltip
        effect="dark"
        content="Exercise Period starts"
        placement="bottom"
        popper-class="y-tooltip"
      >
        <SVGLoadingOne class="chart__loading" :class="status"></SVGLoadingOne>
      </el-tooltip>
      <el-progress
        :stroke-width="13.3"
        :percentage="collectPercentage"
        :show-text="false"
        class="chart__exercise-progress"
      />
      <el-tooltip
        effect="dark"
        content="Unlock"
        placement="bottom"
        popper-class="y-tooltip"
      >
        <SVGLockOpen class="chart__unlock"></SVGLockOpen>
      </el-tooltip>
    </div>
  </div>
</template>
<script setup lang="ts">
import { PropType } from 'vue'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration.js'
import SVGLoadingOne from '~icons/icon-park-outline/loading-one'
import SVGLock from '~icons/heroicons-outline/lock-closed'
import SVGLockOpen from '~icons/heroicons-outline/lock-open'
dayjs.extend(duration)
const props = defineProps({
  /** action 类型 */
  type: {
    type: String as PropType<'SNIPER' | 'BULLET'>,
    required: true,
  },
  sniper: {
    type: String,
  },
  optionAddress: {
    type: String,
  },
  matchingAllSniperAmount: {
    type: String,
    default: '0',
  },
  /** option创建时间，单位秒 */
  startTimestamp: {
    type: String,
    required: true,
  },
  /** 行权时间,单位秒 */
  exerciseTimestamp: {
    type: String,
    required: true,
  },
})
const { status } = useOptionStatus(props.exerciseTimestamp)
// 检测是否有可collect的hodl
const hasHODLRewards = computed(() => {
  if (props.optionAddress !== undefined && props.sniper !== undefined) {
    const { calcGetHODL } = useSniperCollect({
      sniper: props.sniper,
      exerciseTimestamp: props.exerciseTimestamp,
      address: props.optionAddress,
    })
    const hodls = calcGetHODL(props.matchingAllSniperAmount)
    return hodls.value.bHODL !== '0' || hodls.value.uHODL !== '0'
  }
  return false
})
// 倒计时文字
const countdown = computed(() => {
  let label = ''
  if (props.type === 'SNIPER') {
    // 过了行权时间
    if (status.value === 'startedCollect') {
      return hasHODLRewards.value ? 'Collectable' : 'Expired'
    }
    label =
      status.value === 'unStartedExercise' ? 'Expires in' : 'Collectable in'
  } else {
    label =
      status.value === 'unStartedExercise' ? 'Expires in' : 'Exercise within'
  }

  const endTimeStamp =
    status.value === 'unStartedExercise'
      ? Number(props.exerciseTimestamp + '000')
      : Number(props.exerciseTimestamp + '000') + 24 * 60 * 60 * 1000
  const startTime = dayjs(new Date())
  const endTime = dayjs(endTimeStamp)
  const diffTime = dayjs.duration(endTime.diff(startTime))

  const countDown =
    diffTime.days() !== 0
      ? diffTime.format('D[d]')
      : diffTime.hours() !== 0
      ? diffTime.format('H[hr]')
      : diffTime.format('m[mins]')

  return `${label} ${countDown}`
})
const exercisePercentage = computed(() => {
  const startTime = Number(props.startTimestamp + '000')
  const endTime = Number(props.exerciseTimestamp + '000')
  const rate = ((Date.now() - startTime) / (endTime - startTime)) * 100
  return rate > 100 ? 100 : rate
})
const collectPercentage = computed(() => {
  const startTime = Number(props.exerciseTimestamp + '000')
  const endTime = startTime + 24 * 60 * 60 * 1000
  const rate = ((Date.now() - startTime) / (endTime - startTime)) * 100

  return rate > 100 ? 100 : rate < 0 ? 0 : rate
})
</script>
<style lang="postcss" scoped>
.table-action-status {
  --yellow: #ffc550;
  min-width: 184px;
  & .status__chart {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-top: 4px;
    text-align: right;
  }
  & .status__countdown {
    font-size: 11px;
    line-height: 18px;
    color: var(--yellow);
  }
  /* [ el-progress样式覆盖 ] */
  & :deep(.el-progress-bar__inner) {
    /* color属性无法使用渐变色，通过设置background覆盖进度条背景色 */
    background: linear-gradient(
      180deg,
      #ffffff -26.22%,
      #fbf0c1 -15.12%,
      #f8e186 -11.21%,
      #ba8330 12.03%,
      #ba8330 19.55%,
      #6c4b0e 41.87%,
      #f6bf57 73.18%,
      #f6bf57 89.26%,
      #fbf0c1 108.39%
    );
  }
  & :deep(.el-progress--line) {
    width: 105.57px; /* 设置进度条长度 */
  }
  & :deep(.el-progress-bar__outer) {
    background-color: #313131; /* 进度条外边背景色 */
  }
  & .chart__lock--start {
    width: 12px;
    height: 12px;
    color: var(--yellow);
  }
  & .chart__countdown-progress {
    margin-left: 5.29px;
  }
  & .chart__loading {
    width: 12px;
    height: 12px;
    margin-left: 2.87px;

    &.unStartedExercise {
      opacity: 0.6;
      &:hover {
        opacity: 1;
      }
    }
    &.unStartedCollect {
      color: var(--yellow);
    }
  }
  & .chart__exercise-progress {
    width: 24.32px;
    margin-left: 2.87px;
  }
  & .chart__unlock {
    width: 12px;
    height: 12px;
    margin-left: 4.31px;
    opacity: 0.6;
    &:hover {
      opacity: 1;
    }
  }
}
.table-action-status.startedCollect {
  & .status__countdown {
    color: #f65046;
  }
  &.hasHODLRewards {
    & .status__countdown {
      color: #64acff;
    }
  }
}
.table-action-status.unStartedCollect.is-BULLET {
  & .status__countdown {
    color: #64acff;
  }
}
</style>
