<template>
  <div class="y-header">
    <div class="y-header-wrap content--max">
      <NuxtLink :to="localePath('/')" aria-label="home">
        <div class="header-logo">
          <img src="~/assets/img/logo@m2x.webp" alt="" />
        </div>
      </NuxtLink>
      <div class="header-href">
        <div class="header-hrefs">
          <template v-for="item in pages" :key="item.name">
            <NuxtLink
              :to="localePath(item.path)"
              :class="{ active: getRouteActive(item) }"
              :active-class="item.activeClass"
              :target="item.target ?? ''"
            >
              {{ $t(item.locale) }}
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>
    <y-dialog
      v-model="showLogoutDialog"
      class="dialog--logout"
      width="370px"
      title="Disconnect Wallet"
    >
      <div class="logout__copy">
        <img :src="MetaMaskImg" alt="" class="wallet_icon" />
        <div
          ref="logoutAddressRef"
          style="position: absolute; top: 0; z-index: -1"
        >
          {{ address }}
        </div>
        <div class="logout__address">
          {{ loginBtnLabel }}
        </div>
        <img
          src="~/assets/img/icon_copy@mini.svg"
          alt=""
          class="copy__icon"
          @click="copyTxAddress"
        />
      </div>
      <y-btn @click="logOut">Disconnect</y-btn>
    </y-dialog>
  </div>
</template>

<script setup lang="ts">
import { useLocalePath } from '#i18n'
import MetaMaskImg from '~/assets/img/icon_connect_MetaMask.png'
const { disconnectWallet } = useWallet()
const router = useRouter()
const extraActiveRoutes: string[] = []
// 如果当前为子路由，为父路由添加active
const getRouteActive = (item) => {
  return (
    router.currentRoute.value.fullPath.startsWith(item.path) &&
    extraActiveRoutes.includes(router.currentRoute.value.path)
  )
}

const pages = computed(() => {
  return [
    {
      path: '/',
      name: 'Home',
      active: false,
      activeClass: 'active',
      locale: 'header.home',
    },
  ]
})

const walletStore = useWalletStore()
const { address } = toRefs(walletStore)

const login = ref(false)

// [ LogOut ]
const showLogoutDialog = ref(false)
const logoutAddressRef = ref(null)
const { copy } = useCopyText()
const copyTxAddress = () => {
  copy(logoutAddressRef.value)
  // TODO: 添加copy成功提示
}
const logOut = () => {
  disconnectWallet()
}

// 钱包相关
const walletTypeValue = ref('metamask' as const)
const { lookupAddress } = useENS()
const loginBtnLabel = computed(() => {
  const walletAddress = address.value
  if (walletAddress && walletAddress.length > 13) {
    login.value = true
    // TODO: 如果ensName很长，按钮宽度问题
    return (
      lookupAddress(address.value).value.state ||
      walletAddress.slice(0, 7) + '...' + walletAddress.slice(-4)
    )
  }
  login.value = false
  return 'Connect Wallet'
})

// TODO: i18n支持后删除
const localePath = useLocalePath()

onBeforeMount(() => {
  const walletTypeStorage = localStorage.getItem('walletType') || 'metamask'
  walletTypeValue.value = walletTypeStorage as 'metamask'
})
</script>

<style lang="postcss" scoped>
:deep(.el-dialog.dialog--logout) {
  background: #26262b;
  border: 0.5px solid #4c4c4c;
  border-radius: 24px;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.61);
  & .logout__copy {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    font-size: 14px;
    font-weight: 600;
    line-height: 18px;
    & .wallet_icon {
      width: 20px;
      height: 20px;
      margin-right: 8px;
    }
    & .copy__icon {
      width: 18px;
      height: 18px;
      margin-left: 8px;
      cursor: pointer;
    }
  }
}

.DOB {
  padding: 12px;

  & > * {
    margin: 16px 0;

    &:last-child {
      margin-bottom: 0;
    }

    &:first-child {
      margin-top: 0;
    }
  }

  & .DOB-icon {
    display: flex;
    align-items: center;
    justify-content: center;

    & img {
      width: 28px;
      margin-right: 8px;
    }
  }

  & .DOB-coin {
    display: flex;
    justify-content: space-between;
    margin: 8px 0;

    & span:first-child {
      display: inline-block;
      min-width: 100px;
    }

    & span:last-child {
      min-width: 100px;
      margin-left: 10px;
      font-weight: 700;
      text-align: right;
    }
  }

  & .DOB-notice {
    font-size: 12px;
    color: rgb(255 255 255 / 60%);
    text-align: center;
    cursor: pointer;
  }
}

.y-header {
  position: sticky;
  top: 0px;
  z-index: 100;
  width: 100vw;
  min-width: 1095px;
  background-color: #151515;

  & .y-header-wrap {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    height: 110px;
    padding-right: 5rem;
    padding-left: 119.83px;
    color: white;
  }

  & .header-logo {
    display: flex;
    align-items: center;
    font-size: 24px;
    font-weight: 600;
    cursor: pointer;
    & img {
      width: 187px;
      height: 37.2969px;
    }
  }

  & .header-href {
    display: flex;
    align-items: center;
    width: 100%;
    padding-left: 135.09px;
    & a:not(.active) {
      opacity: 0.5;
    }

    & .header-hrefs {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      & a {
        font-size: 14px;
        font-weight: 500;
        line-height: 22px;
        color: var(--yellow);
      }
      & > *:not(:last-child) {
        margin-right: 32px;
      }
      & .hrefs--with-icon {
        display: flex;
        flex-direction: row;
        align-items: center;
        & .href-text {
          margin-right: 0.25rem;
        }
        & .href-icon {
          width: auto;
          height: inherit;
          max-height: 16px;
        }
      }
    }

    & .y-popover {
      margin-right: 12px;
    }
  }

  & .header-collect {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    width: fit-content;
  }
}
/* TODO: 下拉菜单样式修复 */
:global(.header__i18n .el-dropdown-menu) {
  /* dropdown组件弹窗背景色 */
  background-color: #26262b;
}
:global(.header__i18n.el-popper.is-light) {
  /* dropdown组件弹窗背景色 */
  background-color: #26262b;
  /* dropdown组件弹窗背景色 */
  border: none;
}
:global(.header__i18n .el-popper__arrow::before) {
  /* dropdown 禁用箭头 */
  content: none;
}
</style>
