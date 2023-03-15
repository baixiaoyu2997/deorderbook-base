import { HODLPoolAccount, HODLPool } from 'deorderbook-sdk'

export type HODLSymbol = 'uHODL' | 'bHODL' | string

export interface FormattedHODLPool extends HODLPool {
  /**
   * hodl pool type, eg: 'uHODL' 'bHODL'.
   */
  type: string
  /**
   * hodl pool name, eg: 'uHODL' 'bHODL'.
   */
  name: string
  /**
   * pool vAPR original data (with 100 denominator), eg: 1, 1.001, 1000
   */
  apr: string
  /**
   * formatted vAPR string, eg: '< 0.01%', '> 10,000%', '100%'.
   */
  aprString: string
  /**
   * token value staked in the pool, eg: 1.2402
   */
  stakedAmountUSD: string
}

export interface FormattedUserHODLPool extends HODLPoolAccount {
  /**
   * target HODLPool token contract address, eg: 0xbbdd61d4985e8e325a31958cf6669ffa961c2064
   */
  token: string
  /**
   * pool type, eg: 'uHODL', 'bHODL'
   */
  type: string

  /**
   * user staked value in USD, eg: 100.0212
   */
  stakedUSD: string

  balance: string
  balanceUSD: string

  /**
   * Current reward DOB amount, eg: 1.2 * 1e18
   */
  rewardDOBAmount: string

  rewardDOBAmountUSD: string

  /**
   * Original vAPR value, eg: 1.1, 100
   */
  apr: string

  /**
   * Formatted vAPR string value, eg: '< 0.01%', '> 10,000%', '1.1%', '100%'
   */
  aprString: string
}
