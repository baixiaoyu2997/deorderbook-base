<template>
  <el-config-provider :locale="locales">
    <NuxtLayout is-layout>
      <div>
        <NuxtPage />
      </div>
    </NuxtLayout>
  </el-config-provider>
</template>
<script setup lang="ts">
// div包裹NuxtPage用于修复打包后无法跳转问题，https://github.com/nuxt/framework/issues/2985
import Big from 'big.js'
import { en, ko } from 'element-plus/es/locale/index'
import { useI18n } from '#i18n'
Big.RM = 0
Big.PE = 50

const { locale } = useI18n()
const route = useRoute()
const currentLocale =
  (route?.matched[0]?.name as string)?.split('___')[1] || 'en'
locale.value = currentLocale

const locales = computed(() => {
  if (locale.value === 'en') return en
  return ko
})
</script>
