import type BN from 'bn.js'
export interface Options {
  rpcHost: string
}
export interface ChainAPI {
  options: Options
}
export interface CreateOptionReq {
  strikePrice: number | string | BN
  startTimestamp: number | string | BN
  exerciseTimestamp: number | string | BN
  optionType: number | string | BN
}
export interface TxParams {
  to?: string
  nonce?: string
}
