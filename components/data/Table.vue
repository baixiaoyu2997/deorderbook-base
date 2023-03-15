<template>
  <div class="y-table__wrap" :style="styleObj">
    <el-table
      ref="elRef"
      v-bind="{ ...$attrs, ...props }"
      :height="height"
      class="y-table"
    >
      <template #default>
        <slot name="default"></slot>
      </template>
    </el-table>
    <div v-if="$slots.pagination" class="y-table__pagination">
      <slot name="pagination"></slot>
    </div>
  </div>
</template>
<script setup lang="ts">
import tableProps from 'element-plus/es/components/table/src/table/defaults'

// 判断 pathname === '/leaderboard'
const isLeaderboard = ref(false)
onMounted(() => {
  isLeaderboard.value = window.location.pathname === '/leaderboard'
})

// import type { PropType } from 'vue'
// 如果要修改组件name，需要同步修改Table其他组件内名称
const props = defineProps({
  ...tableProps,
  // [ 以下为自定义属性 ]
  /**
   * 注意：el-table高度，但是组件会自动减去wrapPadding
   */
  headerHeight: {
    type: String,
    default: '18',
  },
  headerBottom: {
    default: '8',
    type: String,
  },
  /**
   * 最外层padding,会影响el-table的height属性
   */
  wrapPadding: {
    type: String,
    default: '32',
  },
})

const height = computed(() => {
  return props.height
    ? `calc(${props.height} - ${Number(props.wrapPadding) * 2})`
    : undefined
})
const styleObj = reactive({
  '--wrap-padding': `${props.wrapPadding}px`,
  '--header-height': `${props.headerHeight}px`,
  '--header-bottom': `${props.headerBottom}px`,
  height: props.height === '100%' ? '100%' : undefined,
})
// 父组件通过ref.value.elRef.xxx调用element-ui组件方法
const elRef = ref(null)
const toggleRowExpansion = (row, expanded) => {
  elRef.value.toggleRowExpansion(row, expanded)
}

// 判断是否链接钱包
const { isConnected } = useWallet()
// const headerbottom = props.headerBottom
defineExpose({
  toggleRowExpansion,
  elRef,
})
</script>
<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>
<style lang="postcss" scoped>
/* 为了方便为table添加最外层padding */
.y-table__wrap {
  padding: var(--wrap-padding);
  /* table 最外层样式 */
  background: radial-gradient(
    49.67% 49.67% at 88.76% 5.88%,
    #323232 0%,
    #26262b 95.31%
  ); /* table 背景色 */
  border: 0.5px solid #4c4c4c;
  border-radius: 16px;
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.59);
}
.y-table.el-table {
  --el-table-row-hover-bg-color: transparent; /* hover背景色 */
  margin-bottom: -20px; /* 消除row margin的负面影响 */
  /* table 最外层样式 */
  background: transparent; /* table 背景色 */

  & :deep(.el-table__header .cell) {
    padding: 0 0 0 24px; /* header cell 左右边距*/
    /* header column 字体 */
    font-size: 11px;
    font-weight: 400;
    line-height: var(--header-height); /* 决定header高度 */
    color: rgba(255, 255, 255, 0.6);
  }
  & :deep(.el-table__body .cell) {
    padding: 0 0 0 24px; /* body cell 左右边距*/
    /* body column 字体 */
    font-size: 16px;
    font-weight: 600;
    line-height: 20px;
  }
  & :deep(tr) {
    background-color: transparent; /* header部分背景色 */
  }
  & :deep(td.el-table__cell) {
    border-bottom: none; /* 消除 table body cell 无用底部border */
    &:last-child {
      & .cell {
        padding-right: 24px;
      }
    }
  }
  & :deep(th.el-table__cell) {
    /* header column padding */
    padding: 0;
    background-color: transparent; /* header部分背景色 */
  }
  & :deep(.el-table__body .el-table__row .el-table__cell) {
    padding: 15px 0; /* table body cell 边距，可以用来改变row的高度,有border的情况应该-1 */
  }
  & :deep(.el-table__body .el-table__row .el-table__expanded-cell) {
    padding: 0; /* table body 展开cell 边距，可以用来改变row的高度,有border的情况应该-1 */
  }
  & :deep(.el-table__body .el-table__expand-column.el-table__cell > .cell) {
    /* 折叠cell 最小宽度应该大于padding + icon，否则转换角度的时候会出现问题 */
    padding: 0 11.85px 0 0;
  }
  & :deep(.el-table__body .el-table__expand-icon) {
    /* 折叠row 箭头对齐方式,有bug */
    /* text-align: right;  */
    /* 设置折叠icon垂直居中 */
    font-size: 20px;
  }
  & :deep(.el-table__body .el-table__expand-icon > .el-icon) {
    font-size: 16px; /* 折叠row 箭头大小 */
    color: #b1b1b1; /* 折叠row 箭头颜色 */
  }
  & :deep(.el-table__body .el-table__expanded-cell) {
    background: transparent; /* 折叠row展开背景色 */
  }

  & :deep(.el-table__header-wrapper) {
    & tr {
      & th {
        /* header 底部无用边框颜色 */
        border-bottom: none;
      }
    }
  }

  & :deep(table.el-table__header) {
    width: 100% !important; /* 修复使用type=expand时，body宽度没有100%的问题 */
    margin-bottom: var(--header-bottom); /* header 下边距 */
  }

  & :deep(table.el-table__body) {
    --row-margin: 20px;
    --first-row-margin: -20px;
    width: 100% !important; /* 修复使用type=expand时，body宽度没有100%的问题 */
    margin-top: var(--first-row-margin); /* 消除row margin的负面影响 */
    border-spacing: 0 var(--row-margin); /* 设置table row的上下margin */
    border-collapse: separate; /* 设置table row的上下margin */
    border: none;

    & .el-table__row {
      --radius: 24px;
      /* table body row相关设置 */
      /* height: 56px !important;  高度,最好不要设置，应该用cell 的padding来做row的高度 */
      background: #212126; /* 背景色 */

      border-radius: var(--radius); /* 与td圆角对齐，这样可以设置box-shadow */
      box-shadow: inset 0px 0px 6px #141414; /* border shadow */

      /* table body row border相关 */
      & td {
        border-top: 0.5px solid #777777;
        border-bottom: 0.5px solid #777777;
        &:first-child {
          border-top-left-radius: var(--radius);
          border-bottom-left-radius: var(--radius);
        }

        &:last-child {
          border-top-right-radius: var(--radius);
          border-bottom-right-radius: var(--radius);
        }
      }
    }
  }
  /* table最外层padding,最好不要用，会有内容滚动 */
  /* & :deep(.el-table__inner-wrapper) {
    padding: 32px;
  } */

  & :deep(.el-table__inner-wrapper::before) {
    background-color: unset; /* 底部无用背景色 */
  }
  &.is-not-connected :deep(.el-table__body-wrapper) {
    /* table body 边框, 最好不要加border，否则会出滚动条 */
    /* border: 0.5px solid #777777; */
    border-radius: 24px;
    box-shadow: inset 0px 0px 6px #141414;
  }
  /* & :deep(.el-table__expand-icon) {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
  }





  & :deep(.el-table__expanded-cell) {
    padding: 20px;
    border-radius: 8px;
  } */
}
.y-table--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 244px;
  font-size: 16px;
  font-weight: 400;
  line-height: 20px;
  color: #ffffff;
  opacity: 0.5;
}
.y-table__pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 37px;
}
</style>
