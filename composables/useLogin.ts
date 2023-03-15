import { YMessage } from '~/utils'
export const useLogin = (walletType: 'metamask' = 'metamask') => {
  const { connectWallet } = useWallet()
  const { show, hide } = useLoading()
  show()
  return connectWallet(walletType)
    .catch((err) => {
      YMessage.error(err.message)
    })
    .finally(() => {
      hide()
    })
}
