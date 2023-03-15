<template>
  <div class="home-page content--max">
    <div class="home__title">Search by ENS, wallet, or transaction hash</div>
    <y-search-hash v-model="hashValue" class="home__search"></y-search-hash>
    <div class="home__cards">
      <y-card
        v-for="item in deOrderInfos"
        :key="item.label"
        :body-style="{ padding: '32px 0 0' }"
        class="card__item"
      >
        <div class="item__label--wrap">
          <div class="item__label">{{ item.label }}</div>
          <y-tooltip-icon
            v-if="item.tooltip"
            :icon-size="21.6"
            :margin-left="2.7"
            icon-color="rgba(255,255,255,0.3)"
            :content="item.tooltip"
          ></y-tooltip-icon>
        </div>
        <div class="item__value">
          ${{ numberFormat(item.value, 'en-US', { dp: 0 }) }}
        </div>
      </y-card>
    </div>
    <!-- TODO: wait next version -->
    <!-- <div class="home__table">
      <div class="table__title">Tokens in DeOrderBook</div>
      <y-table :data="tableData" :row-key="getTableRowKey">
        <el-table-column prop="token" label="TOKEN">
          <template #default="{ row }">
            <div class="table__row--token">
              <img
                :src="getTokenIcon(row.token)"
                alt=""
                class="table__icon--token"
              />
              {{ row.token }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="PRICE" align="right" sortable>
          <template #default="{ row }">{{ useUSDFormat(row.price) }}</template>
        </el-table-column>
        <el-table-column
          prop="volumeInDeorderBook"
          label="VOLUME IN DEORDERBOOK"
          align="right"
          sortable
        >
          <template #default="{ row }">
            {{ useUSDFormat(row.volumeInDeorderBook) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="totalVolume"
          label="TOTAL VOLUME"
          align="right"
          sortable
        >
          <template #default="{ row }">
            {{ useUSDFormat(row.totalVolume) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="circulatingSupply"
          label="CIRCULATING SUPPLY"
          align="right"
          sortable
        >
          <template #default="{ row }">
            {{ numberFormat(row.circulatingSupply) }}
          </template>
        </el-table-column>
      </y-table>
    </div> -->
  </div>
</template>
<script setup lang="ts">
import { Big } from 'big.js'
import { getToken, getTradeList } from 'deorderbook-sdk'
import { MAX_SUPPLY } from 'deorderbook-sdk/ethereum/dob'

// [ Init ]
const { getTokenPrice, getTokenIcon } = useTokens()

// [ Search ]
const hashValue = ref('')

// [ Cards ]
const { tokenWBTC, tokenDOB, tokenUSDC, tokenBHODL, tokenUHODL } = toRefs(
  useTokensStore()
)
const deOrder24hValue = computedAsync(async () => {
  const now = Math.floor(Date.now() / 1000)
  const option = {
    where: {
      action_starts_with: 'DeOrder' as const,
      to: '0', // 过滤不包含fee相关的同名action
      timestamp_lte: `${now}`,
      timestamp_gte: `${now - 24 * 60 * 60}`,
    },
  } as const
  return await getTradeList(option).then((deorderList) => {
    return deorderList
      .reduce((sum, current) => {
        const amount = Big(current.amount).div(1e18)
        const value =
          current.action === 'DeOrderSell'
            ? amount.times(tokenWBTC.value.priceUSD)
            : amount
        return sum.plus(value)
      }, Big(0))
      .toFixed()
  })
}, '0')
const exercise24Value = computedAsync(async () => {
  const now = Math.floor(Date.now() / 1000)
  const option = {
    where: {
      action: 'Exercise' as const,
      to: '1',
      tokenSymbol_ends_with: 'HODL',
      timestamp_lte: `${now}`,
      timestamp_gte: `${now - 24 * 60 * 60}`,
    },
  } as const

  return await getTradeList(option).then((exerciseList) => {
    return exerciseList
      .reduce((sum, current) => {
        const amount = Big(current.amount).div(1e18)
        const value =
          current.tokenSymbol === 'bHODL'
            ? amount.times(tokenWBTC.value.priceUSD)
            : amount
        return sum.plus(value)
      }, Big(0))
      .toFixed()
  })
}, '0')
const bulletMarket24hTxs = computedAsync(async () => {
  const now = Math.floor(Date.now() / 1000)
  const option = {
    where: {
      action: 'Sold BULLET',
      to: '0',
      timestamp_lte: `${now}`,
    },
  } as const

  return await getTradeList(option)
}, [])
// bullet交易中使用了哪些token进行购买
const bulletMarketTokens = computed(() => {
  const tokenList = {} as any
  for (const x of bulletMarket24hTxs.value) {
    if (x.token === undefined) return
    const tokenSymbol = getToken(x.token)?.symbol as
      | 'bHODL'
      | 'uHODL'
      | 'USDC'
      | 'WBTC'

    if (tokenSymbol && !tokenList[tokenSymbol]) {
      tokenList[x.token] = getTokenPrice(tokenSymbol)
    }
  }
  return tokenList
})
const bulletMarket24hValue = computed(() => {
  return bulletMarket24hTxs.value
    .reduce((sum, current) => {
      const amount = div18(current.amount)
      const price = bulletMarketTokens.value[current.token].value || '0'
      return sum.plus(Big(amount).times(price))
    }, Big(0))
    .toFixed()
})
const volume = computed(() => {
  return Big(deOrder24hValue.value)
    .plus(bulletMarket24hValue.value)
    .plus(exercise24Value.value)
    .toFixed() as `${number}`
})

// Total locked
const { formattedPools } = toRefs(usePoolsStore())
const { dobContractInfo } = toRefs(useDOBStore())
const { bHODL, uHODL } = toRefs(useHODLStore())
const bHODLTotalUSD = computed(() => bHODL.value.stakedAmountUSD)
const uHODLTotalUSD = computed(() => uHODL.value.stakedAmountUSD)

const totalValueLocked = computed(() => {
  let optionTotal = '0'
  formattedPools.value.forEach((sniper) => {
    const stakedAmount = sniper.stakedAmount ?? 0
    optionTotal = Big(stakedAmount)
      .times(
        // optionType为0时需要用amount * price
        sniper.type === 'bSNIPER'
          ? Big(sniper.strikePrice).div(Big(10).pow(18))
          : 1
      )
      .div(Big(10).pow(18))
      .plus(optionTotal)
      .toFixed()
  })

  return Big(dobContractInfo.value.totalStake)
    .div(Big(10).pow(18))
    .times(tokenDOB.value.priceUSD)
    .plus(optionTotal)
    .plus(bHODLTotalUSD.value)
    .plus(uHODLTotalUSD.value)
    .toFixed()
})
const { data: dobMxSupply } = useLazyAsyncData(
  'home_dob_total',
  () => MAX_SUPPLY().then((res) => res.toString()),
  {
    default: () => '0',
    server: false,
  }
)
const dobMaxSupplyUSD = computed(() => {
  return Big(dobMxSupply.value || 0)
    .times(tokenDOB.value.priceUSD || 0)
    .toFixed()
})

const deOrderInfos = computed(() => {
  return [
    {
      label: 'DeOrderBook Daily Volume',
      tooltip:
        'Aggregate value of DeOrder buys and sells in DeOrderBook over the last 24-hour period',
      value: volume.value,
    },
    {
      label: 'Total Value Locked',
      value: totalValueLocked.value,
    },
    {
      label: '$DOB Fully Diluted Value',
      value: div18(dobMaxSupplyUSD.value),
    },
  ]
})

// [ Table ]
const tableData = computed(() => {
  // volume means to count the dollar-value of any transaction involving the token
  // circulating supply means the supply that's not locked and it'll come from CoinGecko
  return [
    {
      token: 'DOB',
      price: tokenDOB.value.priceUSD,
      volumeInDeorderBook: '1500000', // TODO: mock
      totalVolume: '36121081090', // TODO: mock
      circulatingSupply: '1000000000', // TODO: 流通量就是总额减去保存在金库账号中的数据
    },
    {
      token: 'WBTC',
      price: tokenWBTC.value.priceUSD,
      volumeInDeorderBook: '1500000', // TODO: mock
      totalVolume: '36121081090', // TODO: mock
      circulatingSupply: '1000000000', // TODO: mock
    },
    {
      token: 'USDC',
      price: tokenUSDC.value.priceUSD,
      volumeInDeorderBook: '1500000', // TODO: mock
      totalVolume: '36121081090', // TODO: mock
      circulatingSupply: '1000000000', // TODO: mock
    },
    {
      token: 'bHODL',
      price: tokenBHODL.value.priceUSD,
      volumeInDeorderBook: '1500000', // TODO: mock
      totalVolume: '36121081090', // TODO: mock
      circulatingSupply: '1000000000', // TODO: mock
    },
    {
      token: 'uHODL',
      price: tokenUHODL.value.priceUSD,
      volumeInDeorderBook: '1500000', // TODO: mock
      totalVolume: '36121081090', // TODO: mock
      circulatingSupply: '1000000000', // TODO: mock
    },
    // TODO: 与产品确认是否有bullet
  ]
}) // TODO: mock
const getTableRowKey = (row: any) => {
  const sameTokenKey = ['SNIPER', 'BULLET'].some((token) =>
    row.token.endsWith(token)
  )
    ? row.sniper
    : ''
  return row.token + sameTokenKey
}
</script>
<style lang="postcss" scoped>
.home-page {
  padding-top: 107.43px;
  padding-bottom: 158px;
  & .home__title {
    font-size: 32px;
    font-weight: 600;
    line-height: 48px;
    text-align: center;
  }
  & .home__search {
    margin: 48px auto 0;
  }
  & .home__cards {
    display: flex;
    justify-content: space-between;
    padding: 0 41.75px;
    margin: 48px auto 0;
    & .card__item {
      width: 327px;
      height: 148px;
      & .item__label--wrap {
        display: flex;
        align-items: center;
        justify-content: center;

        & .item__label {
          font-size: 16px;
          font-weight: 600;
          line-height: 20px;
          opacity: 0.6;
        }
      }
      & .item__value {
        margin-top: 16px;
        font-size: 32px;
        font-weight: 700;
        line-height: 48px;
        text-align: center;
        background: linear-gradient(
          180deg,
          #ffffff 0%,
          #fbf0c1 15.62%,
          #f8e186 30.73%,
          #ba8330 53.12%,
          #f6bf57 78.65%,
          #3d2a07 96.87%
        );
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }
  }
  & .home__table {
    margin-top: 120px;
    & .table__title {
      font-size: 32px;
      font-weight: 600;
      line-height: 24px;
    }
    & :deep(.y-table__wrap) {
      margin-top: 32px;
    }
    & .table__row--token {
      display: flex;
      align-items: center;
      & .table__icon--token {
        width: 24px;
        height: 24px;
        margin-right: 8px;
      }
    }
  }
}
</style>
