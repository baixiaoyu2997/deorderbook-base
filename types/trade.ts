interface FormatTokenFlow {
  token:
    | 'uSNIPER'
    | 'bSNIPER'
    | 'bHODL'
    | 'uHODL'
    | 'uBULLET'
    | 'bBULLET'
    | null
  address: string | null
  amount: string | null
  usd: string | null
  optionType: '0' | '1' | null
  strikePrice: string | null
  exerciseTimestamp: string | null
}
interface FormatTrade {
  id: string
  account: string
  action:
    | 'DeOrderSell'
    | 'DeOrderBuy'
    | 'Mint'
    | 'Lock'
    | 'Stake'
    | 'HODLStake'
    | 'Unstake'
    | 'HODLUnstake'
    | 'Redeem'
    | 'Claim'
    | 'HODLClaim'
    | 'DOBClaim'
    | 'Exercise'
    | 'Unwind'
    | 'Withdraw' // dob unstake
    | 'Collect'
    | 'SellBULLET'
    | 'SoldBULLET'
    | 'BuyBULLET'
    | 'BULLETClaim'
  pool: string | null
  label:
    | 'DeOrder'
    | 'Mint'
    | 'Lock'
    | 'Stake'
    | 'Unstake'
    | 'Redeem'
    | 'Claim'
    | 'Exercise'
    | 'Unwind'
    | 'Withdraw'
    | 'Collect'
  txHash: string
  underToken: 'bHODL' | 'uHODL' | null
  underTokenAmount: string | null
  underTokenUSD: string | null
  outToken: 'uHODL' | 'bHODL' | 'uSNIPER' | 'bSNIPER' | null
  outTokenAddress: string | null
  outTokenAmount: string | null
  outTokenUSD: string | null
  outToken2: 'uHODL' | 'bHODL' | null
  outToken2Amount: string | null
  outToken2USD: string | null
  inTokens: FormatTokenFlow[]
  timestamp: string
  optionType: '0' | '1' | null
  strikePrice: string | null
  exerciseTimestamp: string | null
  poolId: '1' | '2' | null
  lockUntil: string | null
  apy: string | null
  fees: string | null
  feeToken: 'uHODL' | 'bHODL' | null
  feesUSD: string | null
  fees2: string | null
  fee2Token: 'uHODL' | 'bHODL' | null
  fees2USD: string | null
  contract:
    | 'BHODLPool'
    | 'DOBStakingPool'
    | 'HODLStakingPool'
    | 'MatchingMarket'
    | 'Option'
    | 'StakingPool'
    | 'UHODLPool'
    | 'USDC'
    | 'WBTC'
  contractAddress: string
  bulletOTCPrice: string | null
  bulletOTCBuyToken: 'uHODL' | null
  bulletOTCUSD: string | null
  openTimestamp: string | null
}
