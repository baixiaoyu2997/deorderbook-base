<template>
  <div class="y-footer">
    <div class="footer__wrap">
      <div class="icon__groups">
        <SVGTwitter width="24" height="24"></SVGTwitter>
        <SVGDiscord width="24" height="24"></SVGDiscord>
        <img
          src="~/assets/img/footer_mirror@m2x.png"
          alt=""
          :style="{ width: '24px', height: '24px' }"
        />
      </div>
      <div class="footer__copyright">
        <img src="~/assets/img/copyright.png" alt="" />
        Copyright {{ year }} DeOrderBook
      </div>
    </div>
    <div class="footer__links">
      <NuxtLink
        v-for="item in links"
        :key="item.text"
        :to="item.to"
        class="links__item"
      >
        {{ item.text }}
      </NuxtLink>
    </div>
  </div>
</template>
<script setup lang="ts">
import SVGTwitter from '~icons/mdi/twitter'
import SVGDiscord from '~icons/ic/outline-discord'
const year = new Date().getFullYear()
// TODO: 修改跳转链接
const links = ref([
  {
    text: 'Docs',
    to: '/',
  },
  {
    text: 'Tutorial & Demo',
    to: '/',
  },
])
</script>
<style lang="postcss" scoped>
.y-footer {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 103.23px;
  font-size: 12px;
  font-weight: 400;
  line-height: 24px;
  color: #cacaca;
  border-top: 1px solid rgba(255, 255, 255, 0.05);

  & .footer__wrap {
  }
  & .icon__groups {
    display: flex;
    justify-content: space-between;
    width: 109.65px;
    margin: 0 auto;
    color: #fff;
  }

  & .footer__copyright {
    margin-top: 8px;

    & img {
      position: relative;
      top: 1px;
      width: 12px;
      height: 12px;
      margin-right: 2px;
    }
  }
  & .footer__links {
    position: absolute;
    top: 26.89px;
    right: 70px;
    font-size: 14px;
    font-weight: 600;
    line-height: 18px;
    & .links__item {
      margin-left: 24px;
    }
  }
}
</style>
