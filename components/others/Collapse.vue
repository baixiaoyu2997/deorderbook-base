<template>
  <div ref="elRef" v-bind="{ ...$attrs, ...props }" class="y-collapse">
    <div class="collapse__header">
      <div class="header__title">{{ props.title }}</div>
      <img
        :src="isStar ? iconEnum.starFull : iconEnum.star"
        alt=""
        class="header__star"
      />
      <img
        :src="iconEnum.arrow"
        alt=""
        class="header__arrow"
        :class="isShow ? 'arrow-up' : 'arrow--down'"
        @click="onToggle"
      />
    </div>
    <transition name="opacity">
      <div v-if="!isShow" class="collapse__desc">
        <slot name="desc"></slot>
      </div>
    </transition>
    <el-collapse-transition>
      <div v-show="isShow" class="collapse__form">
        <slot name="form"></slot>
      </div>
    </el-collapse-transition>
  </div>
</template>
<script setup lang="ts">
import iconStar from '~/assets/img/icon_collect@2x.png'
import iconStarFull from '~/assets/img/icon_collect_full@2x.png'
import iconArrow from '~/assets/img/icon_arrow@2x.png'
// 支持.collapse__line工具类，实现渐变虚线，详情查看demo
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  isStar: Boolean,
  name: {
    type: String,
    default: '',
  },
})
const emits = defineEmits(['change'])

const iconEnum = {
  star: iconStar,
  starFull: iconStarFull,
  arrow: iconArrow,
}
const isShow = ref(false)
const onToggle = () => {
  isShow.value = !isShow.value
  emits('change', isShow.value, elRef)
}
// 父组件通过ref.value.elRef.xxx调用element-ui组件方法
const elRef = ref(null)
</script>
<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>
<style lang="postcss" scoped>
.y-collapse {
  position: relative;
  background: rgb(40 40 40 / 60%);
  border-radius: 8px;

  & .collapse__header {
    display: flex;
    align-items: center;
    padding: 20px 22px 20px 20px;
    border-bottom: 1px solid rgb(255 255 255 / 10%);

    & img {
      width: 20px;
      height: 20px;
    }

    & .header__title {
      width: calc(100% - 50px);
      overflow: hidden;
      font-size: 20px;
      font-weight: bold;
      line-height: 26px;
      text-overflow: ellipsis;
    }

    & .header__arrow {
      margin-left: 16px;
      cursor: pointer;
      transition: transform 0.3s;

      &.arrow--down {
        opacity: 0.6;
        transform: rotate(180deg);
      }
    }
  }

  & .collapse__desc {
    padding: 20px;
  }

  & .collapse__form {
    padding: 20px;
  }
}

@keyframes fade {
  0% {
    position: absolute;
    opacity: 0;
  }

  50% {
    position: absolute;
    opacity: 0;
  }

  51% {
    position: relative;
    opacity: 0.5;
    transform: translateY(-15px);
  }

  100% {
    position: relative;
    opacity: 1;
  }
}

.opacity-enter-active {
  width: 100%;
  animation: fade 0.6s;
}

.opacity-leave-active {
  transition: 0;
}
</style>
