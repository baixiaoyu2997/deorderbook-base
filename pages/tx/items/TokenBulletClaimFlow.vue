<template>
  <div class="token__flow">
    <div class="block__title">{{ title }}</div>
    <div class="block__main">
      <div v-if="bBULLETTokens.length > 0">
        <div
          v-for="(token, index) in bBULLETTokens"
          :key="token.token!"
          class="main__token"
        >
          <div class="token__info">
            <img :src="getTokenIcon(token.token!)" alt="" />
            <span>
              {{
                useTokenNumberFormat(div18(token.amount || '0'), {
                  token: token.token!,
                }) +
                ' ' +
                token.token
              }}
            </span>
          </div>
          <div class="token__subtext">
            <div class="subtext__label">Strike:</div>
            <div class="subtext__value">
              ${{ numberFormat(div18(token.strikePrice || '0')) }}
            </div>
            <div class="subtext__label">Expiry:</div>
            <div class="subtext__value">
              {{
                dayjs(Number(token.exerciseTimestamp || 0) * 1000).format(
                  'DD MMM, YYYY'
                )
              }}
            </div>
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
            v-if="index !== bBULLETTokens.length - 1"
            width="24"
            height="24"
            class="svg__plus"
          ></SVGPlus>
        </div>
      </div>
      <SVGPlus
        v-if="bBULLETTokens.length > 0 && uBULLETTokens.length > 0"
        width="24"
        height="24"
        class="svg__plus"
      ></SVGPlus>
      <div v-if="uBULLETTokens.length > 0">
        <div
          v-for="(token, index) in uBULLETTokens"
          :key="token.token!"
          class="main__token"
        >
          <div class="token__info">
            <img :src="getTokenIcon(token.token!)" alt="" />
            <span>
              {{
                useTokenNumberFormat(div18(token.amount || '0'), {
                  token: token.token!,
                }) +
                ' ' +
                token.token
              }}
            </span>
          </div>
          <div class="token__subtext">
            <div class="subtext__label">Strike:</div>
            <div class="subtext__value">
              ${{ numberFormat(div18(token.strikePrice || '0')) }}
            </div>
            <div class="subtext__label">Expiry:</div>
            <div class="subtext__value">
              {{
                dayjs(Number(token.exerciseTimestamp || 0) * 1000).format(
                  'DD MMM, YYYY'
                )
              }}
            </div>
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
            v-if="index !== uBULLETTokens.length - 1"
            width="24"
            height="24"
            class="svg__plus"
          ></SVGPlus>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import dayjs from 'dayjs'
import SVGPlus from '~icons/lucide/plus'
/**
 * for BULLETClaim action
 */
const props = defineProps({
  title: {
    type: String as PropType<'Amount OUT' | 'Amount IN'>,
    required: true,
  },
  tokens: {
    type: Array as PropType<FormatTokenFlow[]>,
    required: true,
  },
  usdPrefix: {
    type: String,
    default: undefined,
  },
})
const { getTokenIcon } = useTokens()

const bBULLETTokens = computed(() => {
  return props.tokens.filter((token) => {
    return token.token === 'bBULLET'
  })
})
console.log(bBULLETTokens)
const uBULLETTokens = computed(() => {
  return props.tokens.filter((token) => {
    return token.token === 'uBULLET'
  })
})
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
    display: flex;
    align-items: flex-start;
    padding: 12px 26px;
    margin-top: 4px;
    background: #212126;
    border: 1px solid #4d4d4d;
    border-radius: 16px;
    & .svg__plus {
      align-self: center;
      margin: 0 32px;
      opacity: 0.3;
    }
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
      & .token__subtext {
        display: flex;
        margin-top: 4px;
        font-size: 12px;
        font-weight: 400;
        line-height: 18px;
        color: #ffffff;
        & .subtext__label {
          opacity: 0.5;
          &:not(:first-child) {
            margin-left: 8px;
          }
        }
        & .subtext__value {
          margin-left: 4px;
        }
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
