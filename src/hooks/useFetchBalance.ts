// react hook to fetch balanc of erc token

import {
  erc20dummyABI,
  getRpcProvider,
  mumbaiTestnetMaticContractAddress,
} from '@/constant/const'
import { Contract } from 'ethers'
import { toast } from 'react-toastify'
import { useAccount } from 'wagmi'
import { polygonMumbai } from 'wagmi/chains'

export const useFetchBalance = (
  tokenAddress: string = mumbaiTestnetMaticContractAddress,
  chainId: number = polygonMumbai.id
) => {
  const { address } = useAccount()
  const contract = new Contract(
    tokenAddress,
    erc20dummyABI,
    getRpcProvider(chainId)
  )

  const fetchBalance = async () => {
    if (!address) {
      toast.error('Please connect your wallet')
      throw new Error('Please connect your wallet')
    }
    const decimals = await contract.decimals()
    const balance = await contract.balanceOf(address)
    return balance / 10 ** decimals
  }

  return { fetchBalance }
}
