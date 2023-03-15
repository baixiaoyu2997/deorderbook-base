<template>
  <div class="token-block">
    <div class="token__info">
      <img v-if="token" :src="getTokenIcon(token)" alt="" />
      <span>
        {{
          amount
            ? amount === '0'
              ? '0'
              : useTokenNumberFormat(div18(amount), {
                  token: token!,
                }) +
                ' ' +
                token
            : '0'
        }}
      </span>
    </div>
    <div v-if="usd" class="token__usd">
      {{
        usd
          ? useUSDFormat(usd, {
              showApprox: true,
            })
          : '-'
      }}
    </div>
  </div>
</template>
<script setup lang="ts">
type Token = {
  token: 'bHODL' | 'uHODL' | 'uSNIPER' | 'bSNIPER' | 'uBULLET' | 'bBULLET'
  amount: string | null
  usd: string | null
}
defineProps<Token>()
const { getTokenIcon } = useTokens()
</script>
<style lang="postcss" scoped>
.token-block {
  & .token__info {
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 600;
    line-height: 18px;
  }
  & img {
    width: 16px;
    height: 16px;
    margin-right: 8px;
  }
  & .token__usd {
    margin-top: 4px;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    opacity: 0.5;
  }
}
</style>
