<template>
  <div class="home__swiper">
    <client-only>
      <div
        ref="swiperContainerRef"
        class="swiper__container"
        :class="{ move: showSwiper }"
      >
        <div ref="swiperRef" class="swiper">
          <div
            v-for="(item, index) in formatBackedList"
            :key="index"
            class="swiper__item"
          >
            <img
              src="~/assets/img/home_swiper_symbol@2x.png"
              alt=""
              class="item__symbol"
            />
            <div class="item__text">{{ index }}{{ item.text }}</div>
            <div class="item__user">
              <img :src="item.avatar" class="user__avatar" />
              <div class="user__info">
                <div class="user__name">{{ item.name }}</div>
                <div class="user__introduce">{{ item.info }}</div>
              </div>
            </div>
          </div>
        </div>
        <div
          v-if="showSwiper"
          class="swiper"
          v-html="swiperRef && swiperRef.innerHTML"
        ></div>
      </div>
    </client-only>
  </div>
</template>
<script setup lang="ts">
// TODO: 初步能用，后续再优化
// 文档： 无限轮播组件，特性：1. 两行展示，2. 监听屏幕宽度，数据不够时，停止轮播
const windowSize = useWindowSize()
// 轮播假数据
const backedList = reactive({
  list: new Array(10).fill(1).map((x, index) => {
    return index % 2 === 0
      ? {
          text: 'You can mine any cryptocurrency available in our catalogue! Switch your mining power on the fly for all the coins using our bitcoin mining website.',
          name: 'Michael',
          avatar: 'http://unsplash.it/40/40?random',
          info: 'Mining enthusiast',
        }
      : {
          text: 'What’s that you say? You don’t know the first thing about what fractional-reserve banking is or how it works? You’re not alone. We recently conducted a study of 1,000 US consumers and nearly 26% .',
          name: 'Michael',
          avatar: 'http://unsplash.it/40/40?random',
          info: 'Mining enthusiast',
        }
  }),
})

const listWidth = computed(() => {
  return Math.ceil(backedList.list.length / 2) * (384 + 24)
})
const swiperContainerRef = ref(null)
const swiperRef = ref(null)
const swiperWidth = useCssVar('--swiper-width', swiperContainerRef.value)
const swiperLeft = useCssVar('--swiper-left', swiperContainerRef.value)
const swiperTime = useCssVar('--swiper-time', swiperContainerRef.value)

watchEffect(() => {
  swiperWidth.value = `${listWidth.value}px`
  swiperLeft.value = `-${listWidth.value}px`
  swiperTime.value = `${backedList.list.length * 2}s`
})

const showSwiper = computed(() => {
  return backedList.list.length > 6 && listWidth.value > windowSize.width.value
})

const formatBackedList = computed(() => {
  const copyList = [...backedList.list]
  return showSwiper.value ? backedList.list : (copyList.length = 6) && copyList
})
</script>

<style lang="postcss" scoped>
.home__swiper {
  position: relative;
  height: 514px;
  margin-top: 64px;
  overflow: hidden;

  & .swiper__container {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;

    &.move {
      animation: var(--swiper-time) move infinite linear;
    }

    @keyframes move {
      0% {
        left: 0;
      }

      100% {
        left: var(--swiper-left);
      }
    }

    & .swiper {
      display: flex;
      flex: none;
      flex-flow: column wrap;
      align-content: flex-start;
      justify-content: space-between;
      width: var(--swiper-width);
      height: 514px;

      & .swiper__item {
        display: flex;
        flex: none;
        flex-direction: column;
        width: 384px;
        height: 237px;
        padding: 20px 24px 20px 16px;
        margin-right: 24px;
        background: var(--bg-lighter-3);
        border-radius: 8px;

        & .item__symbol {
          width: 6.5px;
          height: 8px;
        }

        & .item__text {
          flex: 1;
          margin-top: 20px;
          margin-left: 8px;
          font-family: Roboto, sans-serif;
          font-size: 14px;
          line-height: 24px;
          color: #c9c9c9;
        }

        & .item__user {
          display: flex;
          align-items: center;
          margin-left: 4px;

          & .user__avatar {
            width: 40px;
            height: 40px;
            margin-right: 13px;
            border-radius: 50%;
          }

          & .user__name {
            font-size: 16px;
            font-weight: bold;
            line-height: 24px;
          }

          & .user__introduce {
            font-size: 14px;
            line-height: 24px;
          }
        }
      }
    }
  }
}
</style>
