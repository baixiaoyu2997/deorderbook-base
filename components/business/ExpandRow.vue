<template>
  <div class="table__expand--warp">
    <template v-if="showBlocks.includes('sniperStake')">
      <div class="item__sniper-stake row__block">
        <div class="block__info">
          <div>
            <div>
              {{ sniperStakeBlock.text }}
            </div>
          </div>
        </div>
        <div class="block__buttons">
          <y-btn
            v-for="(item, index) in sniperStakeBlock.buttons"
            :key="index"
            :disabled="item.disable"
            bg
            width="100"
            height="36"
            @click="item.onClick(row)"
          >
            {{ item.action }}
          </y-btn>
        </div>
      </div>
      <y-sniper-stake-dialog
        :id="row.id"
        v-model="showSniperStakeDialog"
        :title="row.nickName"
        type="Stake"
        :sniper-data="row.sniperData"
      ></y-sniper-stake-dialog>
    </template>
    <template v-if="showBlocks.includes('deorder')">
      <div class="item__sniper-stake row__block">
        <div class="block__info">
          <div>
            <div>
              {{ deOrderBlock.text }}
            </div>
          </div>
        </div>
        <div class="block__buttons">
          <y-btn
            v-for="(item, index) in deOrderBlock.buttons"
            :key="index"
            :disabled="item.disable"
            bg
            width="100"
            height="36"
            @click="item.onClick(row)"
          >
            {{ item.action }}
          </y-btn>
        </div>
      </div>
    </template>
    <!-- <template v-if="showBlocks.includes('sniperUnstake')">
      <div class="item__sniper-unstake row__block">
        <div class="block__info">
          <div>
            <div>
              {{ sniperUnstakeBlock.text }}
            </div>
          </div>
        </div>
        <div class="block__buttons">
          <y-btn
            v-for="(item, index) in sniperUnstakeBlock.buttons"
            :key="index"
            :disabled="item.disable"
            bg
            width="100"
            height="36"
            @click="item.onClick(row)"
          >
            {{ item.action }}
          </y-btn>
        </div>
      </div>
      <y-sniper-stake-dialog
        :id="row.id"
        v-model="showSniperUnstakeDialog"
        :title="row.nickName"
        type="Unstake"
        :matching-sniper-amount="row.matchingSniperAmount"
        :timestamp="row.exerciseTimestamp"
        :apr="row.apr"
        :sniper="row.sniper"
        :option-address="row.optionAddress"
        :staked-sniper="row.stakedAmount"
      ></y-sniper-stake-dialog>
    </template> -->
    <div
      v-if="showBlocks.includes('dobClaim')"
      class="item__dob--claim row__block"
    >
      <div class="block__info">
        <img
          v-if="dobClaimBlock.token"
          :src="getTokenIcon(dobClaimBlock.token)"
          alt=""
        />
        <div>
          <div>
            {{
              useTokenNumberFormat(dobClaimBlock.text || '0', { token: 'DOB' })
            }}
            {{ dobClaimBlock.token }}
          </div>
          <div class="info__subtext">≈ {{ dobClaimBlock.subtext }}</div>
        </div>
      </div>
      <div class="block__buttons">
        <y-btn
          v-for="(item, index) in dobClaimBlock.buttons"
          :key="index"
          :disabled="item.disable"
          bg
          width="100"
          height="36"
          @click="item.onClick(row)"
        >
          {{ item.action }}
        </y-btn>
      </div>
    </div>
    <template v-if="showBlocks.includes('collect')">
      <div class="item__collect row__block">
        <div
          v-for="item in collectBlock.tokens"
          :key="item.token"
          class="block__info"
        >
          <img :src="getTokenIcon(item.token)" alt="" />
          <div>
            <div>
              {{ useTokenNumberFormat(item.amount, { token: item.token }) }}
              {{ item.token }}
            </div>
            <div class="info__subtext">
              {{ useUSDFormat(item.usd, { showApprox: true }) }}
            </div>
          </div>
        </div>
        <div class="block__buttons">
          <y-btn
            v-for="(item, index) in collectBlock.buttons"
            :key="index"
            :disabled="item.disable"
            bg
            width="100"
            height="36"
            @click="item.onClick(row)"
          >
            {{ item.action }}
          </y-btn>
        </div>
      </div>
      <y-collect-dialog
        v-model="showCollectDialog"
        :matching-sniper-amount="row.matchingSniperAmount"
        :timestamp="row.exerciseTimestamp"
        :apr="row.apr"
        :sniper="row.sniper"
        :option-address="row.optionAddress"
        :matching-all-sniper-amount="row.matchingAllSniperAmount"
      ></y-collect-dialog>
    </template>
    <template v-if="showBlocks.includes('unwind')">
      <div class="item__unwind row__block">
        <div class="block__info">
          <div>
            <div>{{ unwindBlock.text }}</div>
          </div>
        </div>
        <div class="block__buttons">
          <y-btn
            v-for="(item, index) in unwindBlock.buttons"
            :key="index"
            :disabled="item.disable"
            bg
            width="100"
            height="36"
            @click="item.onClick(row)"
          >
            {{ item.action }}
          </y-btn>
        </div>
      </div>
      <y-unwind-dialog
        v-model="showUnwindDialog"
        :sniper-data="formattedOptionAccount"
      ></y-unwind-dialog>
    </template>
    <template v-if="showBlocks.includes('exercise')">
      <div class="item__exercise row__block">
        <div class="block__info">
          <div>
            <div>{{ exerciseBlock.text }}</div>
          </div>
        </div>
        <div class="block__buttons">
          <y-btn
            v-for="(item, index) in exerciseBlock.buttons"
            :key="index"
            :disabled="item.disable"
            bg
            width="100"
            height="36"
            @click="item.onClick()"
          >
            {{ item.action }}
          </y-btn>
        </div>
      </div>
      <y-exercise-dialog
        v-model="showExerciseDialog"
        :token="row.token"
        :bullet="row.bullet"
        :option-type="row.token === 'uBULLET' ? '1' : '0'"
        :option-address="row.optionAddress"
        :strike-price="row.strikePrice"
        :bullet-balance="row.matchingBulletAmount"
        :timestamp="row.exerciseTimestamp"
        append-to-body
      ></y-exercise-dialog>
    </template>
    <template v-if="showBlocks.includes('bullet-market')">
      <div class="item__bullet-market row__block">
        <div class="block__info">
          <div>
            <div>{{ bulletMarketBlock.text }}</div>
          </div>
        </div>
        <div class="block__buttons">
          <y-btn
            v-for="(item, index) in bulletMarketBlock.buttons"
            :key="index"
            :disabled="item.disable"
            color-type="gold"
            bg
            width="126"
            height="36"
            @click="item.onClick()"
          >
            {{ item.action }}
            <SVGArrow
              width="16"
              height="16"
              style="margin-left: 4px"
            ></SVGArrow>
          </y-btn>
        </div>
      </div>
    </template>
    <template v-if="showBlocks.includes('redeem')">
      <div class="item__redeem row__block">
        <div class="block__info">
          <div>
            <div>{{ redeemBlock.text }}</div>
          </div>
        </div>
        <div class="block__buttons">
          <y-btn
            v-for="(item, index) in redeemBlock.buttons"
            :key="index"
            :disabled="item.disable"
            bg
            width="100"
            height="36"
            @click="item.onClick()"
          >
            {{ item.action }}
          </y-btn>
        </div>
      </div>
      <y-dialog
        v-model="showRedeemDialog"
        append-to-body
        title="Redeem"
        :show-close="false"
      >
        <YCreateHODL
          :selected="row.token"
          :supports="['Redeem']"
          select-disabled
        ></YCreateHODL>
      </y-dialog>
    </template>
    <template v-if="showBlocks.includes('mint')">
      <div class="item__mint row__block">
        <div class="block__info">
          <div>
            <div>{{ mintBlock.text }}</div>
          </div>
        </div>
        <div class="block__buttons">
          <y-btn
            v-for="(item, index) in mintBlock.buttons"
            :key="index"
            :disabled="item.disable"
            bg
            width="100"
            height="36"
            @click="item.onClick()"
          >
            {{ item.action }}
          </y-btn>
        </div>
      </div>
      <y-dialog
        v-model="showMintDialog"
        append-to-body
        title="Mint"
        :show-close="false"
      >
        <YCreateHODL
          :selected="row.token"
          select-disabled
          @on-success="mintBlock?.onMintSuccess?.()"
        ></YCreateHODL>
      </y-dialog>
    </template>
    <template v-if="showBlocks.includes('lock')">
      <div class="item__lock row__block">
        <div class="block__info">
          <div>
            <div>{{ lockBlock.text }}</div>
          </div>
        </div>
        <div class="block__buttons">
          <y-btn
            v-for="(item, index) in lockBlock.buttons"
            :key="index"
            :disabled="item.disable"
            bg
            width="100"
            height="36"
            @click="item.onClick()"
          >
            {{ item.action }}
          </y-btn>
        </div>
      </div>
      <y-dialog v-model="showLockDialog" title="Lock" append-to-body>
        <BlockLock
          :border="false"
          :padding="false"
          title=""
          @on-success="() => (showLockDialog = false)"
        ></BlockLock>
      </y-dialog>
    </template>
    <template v-if="showBlocks.includes('buy')">
      <div class="item__buy row__block">
        <div class="block__info">
          <div>
            <div>{{ buyBlock.text }}</div>
          </div>
        </div>
        <div class="block__buttons">
          <y-btn
            v-for="(item, index) in buyBlock.buttons"
            :key="index"
            :disabled="item.disable"
            bg
            width="100"
            height="36"
            @click="item.onClick()"
          >
            {{ item.action }}
          </y-btn>
        </div>
      </div>
    </template>
    <template v-if="showBlocks.includes('hodlStake')">
      <div class="item__hodl-stake row__block">
        <div class="block__info">
          <div>
            <div>{{ hodlStakeBlock.text }}</div>
          </div>
        </div>
        <div class="block__buttons">
          <y-btn
            v-for="(item, index) in hodlStakeBlock.buttons"
            :key="index"
            :disabled="item.disable"
            bg
            width="100"
            height="36"
            @click="item.onClick()"
          >
            {{ item.action }}
          </y-btn>
        </div>
      </div>
      <y-HODL-stake-dialog
        v-model="showHODLStakeDialog"
        type="Stake"
        :from-token="hodlStakeBlock.token"
      ></y-HODL-stake-dialog>
    </template>
    <template v-if="showBlocks.includes('hodlUnstake')">
      <div class="item__hodl-unstake row__block">
        <div class="block__info">
          <div>
            <div>{{ hodlUnstakeBlock.text }}</div>
          </div>
        </div>
        <div class="block__buttons">
          <y-btn
            v-for="(item, index) in hodlUnstakeBlock.buttons"
            :key="index"
            :disabled="item.disable"
            bg
            width="100"
            height="36"
            @click="item.onClick()"
          >
            {{ item.action }}
          </y-btn>
        </div>
      </div>
      <y-HODL-stake-dialog
        v-model="showHODLUnstakeDialog"
        type="Unstake"
        :from-token="hodlUnstakeBlock.token"
      ></y-HODL-stake-dialog>
    </template>
  </div>
</template>
<!-- eslint-disable max-lines -->
<script setup lang="ts">
import { PropType } from 'vue'
import { Big } from 'big.js'
import { div18 } from '~/utils'
import BlockLock from '~/pages/lock/items/BlockLock.vue'
import SVGArrow from '~icons/ic/baseline-arrow-outward'
import { useOptionAccountsStore } from '~/store/optionAccounts'
import { FormattedOptionAccount } from '~/types/options'
const props = defineProps({
  row: {
    type: Object as PropType<{
      exerciseTimestamp: `${number}`
      [key: string]: any
    }>,
    default: () => ({}),
  },
  type: {
    type: String as PropType<'myAssets' | 'myStaked' | 'locked'>,
    default: '',
  },
})

const { row, type } = toRefs(props as { row; type })
const loading = useLoading()

const { pageInit } = usePageInit()
const { tokenEnums, getTokenIcon, getTokenPair } = useTokens()
type Tokens = keyof typeof tokenEnums
const showBlocks = computed(() => {
  const token = row.value.token
  let showList: (
    | 'collect'
    | 'sniperStake'
    | 'deorder'
    | 'lock'
    | 'buy'
    | 'unwind'
    | 'exercise'
    | 'bullet-market'
    | 'dobClaim'
    | 'redeem'
    | 'mint'
    | 'hodlStake'
    | 'hodlUnstake'
  )[] = []
  if (type.value === 'myAssets') {
    if (token.endsWith('SNIPER')) {
      showList = ['dobClaim', 'sniperStake', 'deorder']
    } else if (token.endsWith('BULLET')) {
      showList = ['unwind', 'exercise', `bullet-market`]
    } else if (token.endsWith('HODL')) {
      showList = ['deorder', 'redeem', 'hodlStake']
    } else if (['WBTC', 'USDC'].includes(token)) {
      showList = ['deorder', 'mint', 'buy']
    } else if (token === 'DOB') {
      showList = ['deorder', 'lock', 'buy'] // lock
    }
  } else if (type.value === 'myStaked') {
    if (token.endsWith('HODL')) {
      showList = ['dobClaim', 'hodlUnstake']
    } else if (token.endsWith('SNIPER')) {
      showList = ['dobClaim', 'collect', 'unwind']
    }
  }

  return showList
})
// [ Sniper Stake ]
const showSniperStakeDialog = ref(false)
const sniperStakeBlock = computed(() => {
  return showBlocks.value.includes('sniperStake')
    ? {
        token: '',
        text: `Stake ${row.value.token} earn DOB`,
        buttons: [
          {
            action: `Stake ${row.value.token}`,
            disable:
              Number(row.value.exerciseTimestamp) <= Date.now() ||
              Number(row.value.matchingSniperAmount <= 0),
            onClick: () => {
              showSniperStakeDialog.value = true
            },
          },
        ],
      }
    : {}
})
// [ DeOrder ]
const deOrderBlock = computed(() => {
  const disable = Big(row.value.balance || '0').lte(0)
  let text = `Perform a DeOrder to gain DOB from SNIPER`
  let token = ''
  if (
    row.value.token === 'WBTC' ||
    row.value.token === 'USDC' ||
    row.value.token === 'uHODL' ||
    row.value.token === 'bHODL'
  ) {
    text = `Perform a DeOrder with ${row.value.token} token`
    token = row.value.token
  }
  return showBlocks.value.includes('deorder')
    ? {
        text,
        buttons: [
          {
            action: `Deorder`,
            disable,
            onClick: (row: any) => {
              return navigateTo(
                '/deorder' + (token === '' ? '' : `?from=${token}`)
              )
            },
          },
        ],
      }
    : {}
})

// [ DOB Claim ]
const dobClaimBlock = computed(() => {
  if (showBlocks.value.includes('dobClaim')) {
    let disable = true
    let doClaim
    let dobAmount = '0'
    if (row.value.token.endsWith('SNIPER')) {
      const { claim: sniperClaim } = useSniperClaim()
      disable = Number(row.value.dobAmount) === 0
      doClaim = (row) => sniperClaim(row.id, pageInit)
      dobAmount = row.value.dobAmount
    } else if (row.value.token.endsWith('HODL')) {
      const { doClaim: hodlClaim, currentHODL } = useHODLClaim({
        symbol: row.value.token,
      })
      disable = Number(currentHODL.value.rewardDOBAmount) === 0
      doClaim = () => hodlClaim().then(() => pageInit())
      dobAmount = div18(currentHODL.value.rewardDOBAmount)
    }

    return {
      token: 'DOB' as Tokens,
      text: dobAmount,
      subtext: row.value.rewards,
      buttons: [
        {
          action: 'Claim',
          disable: unref(disable),
          onClick: doClaim,
        },
      ],
    }
  } else {
    return {}
  }
})

// [ collect ]
const showCollectDialog = ref(false)
const collectDisable = ref(false as boolean)
const { getTokenPrice } = useTokens()
const uHODLUSD = getTokenPrice('uHODL')
const bHODLUSD = getTokenPrice('bHODL')
const onCollectClick = async (row) => {
  // TODO: 完成提交后，显示loading弹窗
  const { doCollect } = useSniperCollect({
    exerciseTimestamp: row.value.exerciseTimestamp,
    sniper: row.value.sniper,
    address: row.value.optionAddress,
  })
  loading.show()

  await doCollect(
    Big(row.value.matchingAllSniperAmount)
      .times(10 ** 18)
      .toFixed()
  )
  pageInit()
}
const collectBlock = computed(() => {
  if (showBlocks.value.includes('collect')) {
    const { disable, calcGetHODL } = useSniperCollect({
      exerciseTimestamp: row.value?.exerciseTimestamp,
      sniper: row.value?.sniper,
      address: row.value?.optionAddress,
    })
    collectDisable.value = disable.value
    const hodlReward = calcGetHODL(div18(row.value.matchingAllSniperAmount))
    const tokens = [] as any[]

    Object.keys(hodlReward.value).forEach((x) => {
      if (hodlReward.value[x] !== '0' && x !== 'hasHODLReward') {
        tokens.push({
          token: x as 'bHODL' | 'uHODL',
          amount: hodlReward.value[x],
          usd: Big(x === 'bHODL' ? bHODLUSD.value : uHODLUSD.value)
            .times(hodlReward.value[x])
            .toFixed(),
        })
      }
    })
    return {
      token: row.value.token === 'uSNIPER' ? 'uHODL' : 'bHODL',
      text: useTokenNumberFormat(div18(row.value.matchingAllSniperAmount), {
        token: row.value.token,
      }),
      tokens,
      buttons: [
        {
          action: 'Collect',
          disable: collectDisable.value,
          onClick: () => onCollectClick(row),
        },
      ],
    }
  } else {
    return {}
  }
})
// [ Unwind ]
const showUnwindDialog = ref(false)
const { unwindable } = useSniperUnwind()
const { getFormattedOptionAccountBy } = useOptionAccountsStore()
const formattedOptionAccount = ref<FormattedOptionAccount>(
  getFormattedOptionAccountBy(row.value.optionAddress)!
)
const unwindBlock = computed(() => {
  return showBlocks.value.includes('unwind')
    ? {
        text: row.value.token.endsWith('SNIPER')
          ? 'Use matching BULLETs to unwind'
          : `Unwind to ${
              row.value.token === 'uBULLET' ? 'uHODL' : 'bHODL'
            } with ${row.value.token} and ${
              row.value.token === 'uBULLET' ? 'uSNIPER' : 'bSNIPER'
            }`,
        subtext: '',
        buttons: [
          {
            action: 'Unwind',
            disable: !unwindable(row.value.exerciseTimestamp),
            onClick: () => {
              if (getFormattedOptionAccountBy(row.value.optionAddress)) {
                formattedOptionAccount.value = getFormattedOptionAccountBy(
                  row.value.optionAddress
                )!
                showUnwindDialog.value = true
              }
            },
          },
        ],
      }
    : {}
})
// [ Exercise ]
const showExerciseDialog = ref(false)
const exerciseBlock = computed(() => {
  if (showBlocks.value.includes('exercise')) {
    const { disable } = useOptionExercise({
      optionType: row.value.token === 'uBULLET' ? '1' : '0',
      exerciseTimestamp: row.value.exerciseTimestamp,
    })
    const token = row.value.token
    return {
      text: `Exercise ${token} with ${
        token === 'bBULLET' ? 'uHODL' : 'bHODL'
      } to receive ${token === 'bBULLET' ? 'bHODL' : 'uHODL'}`,
      subtext: '',
      buttons: [
        {
          action: 'Exercise',
          disable: disable.value,
          onClick: () => {
            showExerciseDialog.value = true
          },
        },
      ],
    }
  } else {
    return {}
  }
})
// [ Bullet Market ]
const bulletMarketBlock = computed(() => {
  if (showBlocks.value.includes('bullet-market')) {
    return {
      text: `Buy or sell BULLET via Bullet Bazaar`,
      subtext: '',
      buttons: [
        {
          action: 'Bullet Bazaar',
          disable: false,
          onClick: () => {
            window.open('/bullet/bullet-market')
          },
        },
      ],
    }
  } else {
    return {}
  }
})
// [ Redeem ]
const showRedeemDialog = ref(false)
const redeemBlock = computed(() => {
  if (showBlocks.value.includes('redeem')) {
    const token = row.value.token as 'uHODL' | 'bHODL'
    const redeemToken = getTokenPair(token)
    const balance = row.value.balance
    return {
      text: `Redeem ${redeemToken} with ${token} 1 to 1`,
      subtext: '',
      buttons: [
        {
          action: `Redeem ${redeemToken}`,
          disable: Number(div18(balance)) <= 0,
          onClick: () => {
            showRedeemDialog.value = true
          },
        },
      ],
    }
  } else {
    return {}
  }
})

// [ Mint ]
const showMintDialog = ref(false)
const mintBlock = computed(() => {
  if (showBlocks.value.includes('mint')) {
    const token = row.value.token as 'WBTC' | 'USDC'
    const mintToken = getTokenPair(token)
    const balance = row.value.balance
    return {
      text: `Mint ${mintToken} with ${token} 1 to 1`,
      subtext: '',
      buttons: [
        {
          action: `Mint ${mintToken}`,
          disable: Number(div18(balance)) <= 0,
          onClick: () => {
            showMintDialog.value = true
          },
        },
      ],
      onMintSuccess: () => {
        showMintDialog.value = false
        pageInit()
      },
    }
  } else {
    return {}
  }
})
// [ Lock ]
const showLockDialog = ref(false)
const lockBlock = computed(() => {
  if (showBlocks.value.includes('lock')) {
    const token = row.value.token as 'DOB'
    const balance = row.value.balance
    return {
      text: `Lock ${token} to earn protocol fees`,
      subtext: '',
      buttons: [
        {
          action: `Lock DOB`,
          disable: Number(div18(balance)) <= 0,
          onClick: () => {
            showLockDialog.value = true
          },
        },
      ],
      onLockSuccess: () => {
        showLockDialog.value = false
        pageInit()
      },
    }
  } else {
    return {}
  }
})
const { marketName, goDex } = useDex()
// [ Buy ]
const buyBlock = computed(() => {
  if (showBlocks.value.includes('buy')) {
    const token = row.value.token as 'WBTC' | 'USDC' | 'DOB'
    return {
      text: `Buy more ${token} in ${marketName}`,
      subtext: '',
      buttons: [
        {
          action: `Buy`,
          disable: false,
          onClick: () => {
            goDex(
              token,
              'swap',
              ['WBTC', 'USDC'].includes(token) ? 'ETH' : 'USDC'
            )
          },
        },
      ],
    }
  } else {
    return {}
  }
})

// [ HODL Stake ]
const showHODLStakeDialog = ref(false)
const hodlStakeBlock = computed(() => {
  if (showBlocks.value.includes('hodlStake')) {
    const token = row.value.token as 'uHODL' | 'bHODL'
    const balance = row.value.balance
    return {
      text: `Stake ${token} to earn DOB`,
      token,
      subtext: '',
      buttons: [
        {
          action: `Stake ${token}`,
          disable: Number(div18(balance)) <= 0,
          onClick: () => {
            showHODLStakeDialog.value = true
          },
        },
      ],
    }
  } else {
    return {}
  }
})
// [ HODL Unstake]
const showHODLUnstakeDialog = ref(false)
const hodlUnstakeBlock = computed(() => {
  if (showBlocks.value.includes('hodlUnstake')) {
    const token = row.value.token as 'uHODL' | 'bHODL'
    const balance = row.value.originAmount // 表示hodl数量
    return {
      text: `Unstake ${useTokenNumberFormat(div18(balance), {
        token,
      })} $${token}`,
      token,
      subtext: '',
      buttons: [
        {
          action: `Unstake`,
          disable: Number(div18(balance)) <= 0,
          onClick: () => {
            showHODLUnstakeDialog.value = true
          },
        },
      ],
    }
  } else {
    return {}
  }
})
</script>
<style lang="postcss" scoped>
.table__expand--warp {
  display: flex;
  justify-content: flex-end;

  & .row__block {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 308px;

    padding: 16px;
    margin-left: 16px;
    background: #212126;
    border: 0.5px solid #777777;
    border-radius: 16px;
    & .block__info {
      display: flex;
      align-items: center;
      margin-bottom: 14px;
      font-size: 16px;
      font-weight: 600;
      line-height: 20px;
      & img {
        width: 24px;
        height: 24px;
        margin-right: 8.5px;
      }
      & .info__subtext {
        margin-top: 4px;
        font-size: 11px;
        font-weight: 400;
        line-height: 18px;
        opacity: 0.6;
      }
    }
    & .block__buttons {
      display: flex;
      justify-content: flex-end;

      & :deep(.el-button) {
        margin-left: 16px;
        font-size: 12px;
        font-weight: 600;
        line-height: 20px;
      }
      & :deep(.el-button:not(:first-child)) {
        margin-left: 16px;
      }
    }
  }
}
</style>
