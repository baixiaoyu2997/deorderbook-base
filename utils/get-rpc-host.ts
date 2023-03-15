import { StaticJsonRpcProvider } from '@ethersproject/providers'
export default function getRpcHost() {
  return useRuntimeConfig().public.chain.rpc[0]
}

export const defaultProvider = new StaticJsonRpcProvider(
  'https://eth-goerli.g.alchemy.com/v2/T8633SqpbTBRiW9dSG4sobZSj8kCo8nI',
  5
)
