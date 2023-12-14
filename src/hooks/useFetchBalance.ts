// react hook to fetch balanc of erc token

import { ForumContractAddress } from '@/constant/const'
import { useAccount } from 'wagmi'
import { polygonMumbai } from 'wagmi/chains'
import { fetchBalance } from '@wagmi/core'

interface UseFetchBalanceParams {
  tokenAddress?: string
  chainId?: number
}

export const useFetchBalance = async ({
  tokenAddress = ForumContractAddress,
  chainId = polygonMumbai.id,
}: UseFetchBalanceParams) => {
  const { address } = useAccount()

  return () =>
    fetchBalance({
      address: address as `0x${string}`,
      token: tokenAddress as `0x${string}`,
      chainId: chainId,
    })
}
