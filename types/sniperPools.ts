/**
 * Formatted sniper pool
 */
export interface FormattedPool {
  /**
   * pool_id, eg: 1, 2 ...
   */
  id: string
  /**
   * pool type, eg: uSNIPER, bSNIPER.
   */
  type: string
  /**
   * option type
   */
  optionType: '0' | '1'
  /**
   * pool name, eg: eg: 'Delta Deluxe Bull'.
   */
  name: string
  /**
   * pool address
   */
  address: string
  /**
   * related option address, eg: 0x32bdb8b2cb0a50c87e6a7b4664130e1c3f82733b
   */
  option: string
  /**
   * pool vAPR original data (with 100 denominator), eg: 1, 1.001, 1000
   */
  apr: string
  /**
   * formatted vAPR string, eg: '< 0.01%', '> 10,000%', '100%'.
   */
  aprString: string
  /**
   * token amount staked in the pool, eg: 1.2*1e18
   */
  stakedAmount: string
  /**
   * token value staked in the pool, eg: 1.2402
   */
  stakedAmountUSD: string
  /**
   * sum sniper amount,only change on deorder
   */
  totalAmount: string
  /**
   * exercise amount in this pool
   */
  exerciseAmount: string

  rewardPerBlock: string
  /**
   * strike price, eg: 17000 * 1e18
   */
  strikePrice: string
  /**
   * related option start timestamp in second unit, eg: 1669276800
   */
  startTimestamp: string
  /**
   * related option exercise timestamp in second unit, eg: 1669276800
   */
  exerciseTimestamp: string
}
