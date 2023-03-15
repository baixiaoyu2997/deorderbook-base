import { defineStore } from 'pinia'
import { getReward } from 'deorderbook-sdk/ethereum/staking_pool_rewarder'
import { stake, userDatas } from 'deorderbook-sdk/ethereum/dob_staking_pool'
import { getHODLStakingPoolBySymbol } from 'deorderbook-sdk/ethereum/hodl_pool'
import { totalSupply } from 'deorderbook-sdk/ethereum/dob'
/**
 * 所有的非共享rpc请求应该在这里调用，方便devtool中追踪action事件
 */
export const useRPCStore = defineStore('rpc', () => {
  const test = () => {}
  return {
    getReward,
    stake,
    userDatas,
    getHODLStakingPoolBySymbol,
    totalSupply,
  }
})
