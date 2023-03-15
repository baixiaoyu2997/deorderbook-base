<template>
  <y-dialog
    v-bind="{ ...$attrs, ...props }"
    :show-close="true"
    :close-on-press-escape="false"
    append-to-body
    class="YTxDialog"
  >
    <div class="wrap__waiting__tx">
      <img class="dialog__bg" src="~/assets/img/loading@mini.webp" alt="" />
      <p class="txt__desc">Waiting for your HODL to be collected...</p>
      <div class="card_tx">
        <div class="txt__title">
          Transaction Hash
          <img
            src="~/assets/img/icon_copy@mini.svg"
            style="width: 18px; height: 18px; margin-left: 8px; cursor: pointer"
            @click="clickCopy"
          />
        </div>
        <div class="txt__value" @click="showDetailForTx">
          1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2
          <img
            src="~/assets/img/icon_arrow_up_right.png"
            style="width: 16px; height: 16px; margin-left: 8px; cursor: pointer"
          />
        </div>
      </div>
    </div>
    <div class="wrap__tx__success">
      <img class="dialog__bg" src="~/assets/img/success@mini.webp" />
      <p class="txt__title">Success!</p>
      <p class="txt__desc">Waiting for your HODL to be collected...</p>
      <div class="wrap__info">
        <div>
          <div>Title</div>
          <div>
            value
            <br />
            <span>≈ $200,000</span>
          </div>
        </div>
      </div>
      <y-btn bg>Go to Account</y-btn>
    </div>
  </y-dialog>
</template>
<script setup lang="ts">
import { dialogProps } from 'element-plus'

const props = defineProps({
  ...dialogProps,
})

const { txHash } = toRefs(useWalletStore())

const showDetailForTx = () => {
  window.open(`https://goerli.etherscan.io/tx/${txHash.value}`)
}

const clickCopy = () => {}
</script>

<style lang="postcss" scoped>
.YTxDialog.el-dialog {
  & .wrap__waiting__tx {
    display: flex;
    flex-direction: column;
    gap: 24px;

    & .dialog__bg {
      display: block;
      width: 224px;
      height: 224px;
      margin: 24px auto;
    }

    & .txt__title {
      font-family: 'Poppins';
      font-size: 16px;
      font-style: normal;
      font-weight: 600;
      line-height: 20px;
      color: #ffffff;
      text-align: center;
    }

    & .txt__desc {
      font-family: 'Poppins';
      font-size: 16px;
      font-style: normal;
      font-weight: 600;
      line-height: 20px;
      color: #ffffff;
      text-align: center;
    }

    & .card_tx {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px 16px;
      background: #212126;
      border: 1px solid rgba(120, 120, 120, 0.2);
      border-radius: 16px;
      box-shadow: inset 0px 0px 6px #141414;

      & .txt__title,
      .txt__value {
        display: flex;
        align-items: center;
      }

      & .txt__title {
        font-size: 14px;
        font-weight: 600;
        line-height: 18px;
      }

      & .txt__value {
        font-size: 12px;
        font-weight: 500;
        line-height: 18px;
        color: #ffffff;
        text-align: left;
        text-decoration-line: underline;
        opacity: 0.6;
      }
    }
  }
}
</style>
