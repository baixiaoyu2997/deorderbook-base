<template>
  <div class="token__flow">
    <div class="block__title">{{ title }}</div>
    <div class="block__main">
      <div
        v-for="(token, index) in tokens"
        :key="token.token"
        class="main__token"
      >
        <div class="token__info">
          <img :src="getTokenIcon(token.token)" alt="" />
          <span>
            {{
              useTokenNumberFormat(div18(token.amount || '0'), {
                token: token.token,
              }) +
              ' ' +
              token.token
            }}
          </span>
        </div>
        <div class="token__usd">
          {{
            useUSDFormat(token.usd || '0', {
              showApprox: true,
              prefix: usdPrefix,
            })
          }}
        </div>
        <SVGPlus
          v-if="index !== tokens.length - 1"
          width="24"
          height="24"
          class="svg__plus"
        ></SVGPlus>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import SVGPlus from '~icons/lucide/plus'
type Token = {
  token:
    | 'uSNIPER'
    | 'bSNIPER'
    | 'bHODL'
    | 'uHODL'
    | 'uBULLET'
    | 'bBULLET'
    | null
  amount: string | null
  usd: string | null
}
const props = defineProps({
  title: {
    type: String as PropType<'Amount OUT' | 'Amount IN'>,
    required: true,
  },
  tokens: {
    type: Array as PropType<Token[]>,
    required: true,
  },
  usdPrefix: {
    type: String,
    default: undefined,
  },
})
const { getTokenIcon } = useTokens()
</script>
<style lang="postcss" scoped>
.token__flow {
  & .block__title {
    font-size: 14px;
    font-weight: 600;
    line-height: 18px;
    color: #ffffff;
    text-align: center;
    opacity: 0.5;
  }
  & .block__main {
    width: 193px;
    padding: 12px 0;
    margin-top: 4px;
    background: #212126;
    border: 1px solid #4d4d4d;
    border-radius: 16px;
    & .main__token {
      text-align: center;
      & .token__info {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        font-weight: 600;
        line-height: 20px;
      }
      & .token__usd {
        margin-top: 4px;
        font-size: 12px;
        font-weight: 400;
        line-height: 18px;
        color: #ffffff;
        opacity: 0.5;
      }
      & .svg__plus {
        margin-top: 4px;
        opacity: 0.3;
      }
      & img {
        width: 24px;
        height: 24px;
        margin-right: 8px;
      }
    }
  }
}
</style>
