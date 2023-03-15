/**
 * Store DOB contract related information.
 */
export interface DOBContractInfo {
  /**
   * DOB contract total supply.
   */
  totalSupply: string
  collectorAddress: string
  rewardDispatchAddress: string
  /**
   * Bullet reward threshold, default is 1000 * 1e18
   */
  bulletRewardThreshold: string
  /**
   * New lock action will increase lock date to 30 days later, eg: 30 * 86400
   */
  extendLockDurations: string
  /**
   * Contract total staked DOB amount.
   */
  totalStake: string
  /**
   * 表示当前周期所用用户质押dob的数量，当累加值超过阈值（bulletRewardThreshold）时才会更新
   */
  totalDailyLockDOB: string
  /**
   * 表示上个周期所用用户质押dob的数量
   */
  lastPeriodTotalDailyLockDOB: string
  /**
   * HODL reward is from collector and rewardDispatcher.
   */
  collectorUHODLBalance: string
  collectorBHODLBalance: string
  rewardDispatchUHODLBalance: string
  rewardDispatchBHODLBalance: string

  // calc value
  totalUHODLRewardUSD: string
  totalBHODLRewardUSD: string
  apr: string
  aprString: string
}

/**
 * User related DOB information.
 */
export interface DOBUserInfo {
  /**
   * Daily staking amount.
   */
  dailyStakingAmount: string
  totalStakingAmount: string

  claimStakingAmount: string
  claimAmountUpdateBlockHeight: string
  currentStakingAmount: string
  stakingAmountUpdateBlockHeight: string

  uHODLEntryAccuReward: string
  bHODLEntryAccuReward: string

  /**
   * Timestamp in second unit.
   */
  lastEntryTimestamp: string
  bHODLReward: string
  uHODLReward: string
}
