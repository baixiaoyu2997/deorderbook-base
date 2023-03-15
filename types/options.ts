import dayjs from 'dayjs'

export class UpdateCache {
  /**
   * Last update timestamp in second unit.
   */
  lastUpdatedAt: number = 0

  static defaultUpdateInternal: number = 12

  updatable(): boolean {
    if (
      dayjs(this.lastUpdatedAt * 1000)
        .add(UpdateCache.defaultUpdateInternal, 'seconds')
        .isAfter(dayjs())
    ) {
      return false
    }
    return true
  }
}

/**
 * Option related fee rate.
 */
export class OptionFee extends UpdateCache {
  exerciseFeeRate: number = 0
  withdrawFeeRate: number = 0
  redeemFeeRate: number = 0
}

/**
 * Formatted user option record.
 */
export interface FormattedOptionAccount {
  /**
   * The id for related sniper pool, eg: 1, 53.
   */
  id: string
  /**
   * The id for related option, eg: 1, 24.
   */
  optionID: string
  /**
   * Type of the sniper, 0: bSNIPER, 1: uSNIPER
   */
  type: 'uSNIPER' | 'bSNIPER'
  /**
   * Type of the option
   */
  optionType: '0' | '1'
  /**
   * Related option nickname, eg: 'Delta Deluxe Bull'.
   */
  name: string
  /**
   * Staking amount for the sniper pool.
   */
  stakedAmount: string
  /**
   * StakedAmount related USD value.
   */
  stakedAmountUSD: string
  /**
   * Matching BULLET amount in the pool.
   */
  matchingBulletAmount: string
  matchingBulletAmountUSD: string
  /**
   * Matching un-staked SNIPER amount in the pool.
   */
  matchingSniperAmount: string
  matchingSniperAmountUSD: string
  /**
   * Matching un-staked SNIPER amount and staked SNIPER amount.
   */
  matchingAllSniperAmount: string
  /**
   * StrikePrice for the option.
   */
  strikePrice: string
  /**
   * Start timestamp for the option, in second.
   */
  startTimestamp: string
  /**
   * Exercise timestamp for the option, in second.
   */
  exerciseTimestamp: string
  /**
   * Expiry timestamp for the option, in second.
   */
  expiryTimestamp: string
  /**
   * Original vAPR for the pool.
   */
  apr: string
  /**
   * Formatted vAPR string for original apr, eg: 98.24%, > 10,000%.
   */
  aprString: string
  /**
   * Claimable DOB amount for the pool.
   */
  claimableDOBAmount: string
  claimableDOBAmountUSD: string
  /**
   * Related sniper contract address.
   */
  sniper: string
  /**
   * Related bullet contract address.
   */
  bullet: string
  /**
   * Related option contract address.
   */
  address: string
}

/**
 * Formatted bullet from subgraph.
 */
export interface FormattedBullet {
  /**
   * Related sniper pool id, eg: 1, 2, 45.
   */
  id: string
  /**
   * eg: uBULLET, bBULLET
   */
  type: 'uBULLET' | 'bBULLET'
  /* option type */
  optionType: '0' | '1'
  /**
   * eg: Related option nickname, eg: 'Delta Deluxe Bull'.
   */
  name: string
  /**
   * Bullet amount, eg: 12*1e18
   */
  amount: string
  /**
   * Related bullet amount USD value, eg: 1234.56
   */
  amountUSD: string
  /**
   * Related option strike price, eg: 12*1e18
   */
  strikePrice: string
  /**
   * Start timestamp for the option, in second.
   */
  startTimestamp: string
  /**
   * Exercise timestamp in second unit, eg: 1669276800
   */
  exerciseTimestamp: string
  /**
   * Bullet contract address, eg: 0x378eef852a0ce60ad1634b97add666d8dd16b696
   */
  bullet: string
  /**
   * Related option contract address: eg: 0x32bdb8b2cb0a50c87e6a7b4664130e1c3f82733b
   */
  address: string
}
