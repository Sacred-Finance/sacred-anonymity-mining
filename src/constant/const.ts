import type { Chain } from 'wagmi/chains'
import {
  arbitrum,
  arbitrumGoerli,
  avalanche,
  avalancheFuji,
  goerli,
  mainnet,
  polygonMumbai,
  sepolia,
} from 'wagmi/chains'
import { SemaphoreEthers } from '@semaphore-protocol/data'
import type { Address } from '@/types/common'
import { createPublicClient, getContract, http } from 'viem'
import type { ForumContract } from '@/constant/abi'
import { abi } from '@/constant/abi'

export const mumbaiTestnetMaticContractAddress = `0x0000000000000000000000000000000000001010`

export const SemaphoreContractAddress = process.env.NEXT_PUBLIC_SEMAPHORE_CONTRACT_ADDRESS as `0x${string}`
export const ForumContractAddress: Address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address

export const RELAYER_URL = process.env.NEXT_PUBLIC_RELAYER_URL ?? 'http://127.0.0.1:3000'

export const supportedChains: { [key: string]: Chain } = {
  [polygonMumbai.id]: polygonMumbai,
  [goerli.id]: goerli,
  [sepolia.id]: sepolia,
  [mainnet.id]: mainnet,
  [avalanche.id]: avalanche,
  [arbitrum.id]: arbitrum,
  [avalancheFuji.id]: avalancheFuji,
  [arbitrumGoerli.id]: arbitrumGoerli,
}

export const chainLogos: { [key: string]: string } = {
  [polygonMumbai.id]: '/poly.png',
  [goerli.id]: '/goerli.png',
  [sepolia.id]: '/eth.png',
  [avalancheFuji.id]: '/avax.png',
  [mainnet.id]: '/eth.png',
  [avalanche.id]: '/avax.png',
  [arbitrum.id]: '/arbitrum.png',
  [arbitrumGoerli.id]: '/arbitrum.png',
}

export const supportedChainsArray = Object.keys(supportedChains).map(k => supportedChains[k])

/** PROVIDERS */

export const getRpcProvider = (chainId: number) => providerMap[chainId]

export const jsonRPCProvider = createPublicClient({
  chain: polygonMumbai,
  transport: http(process.env.NEXT_PUBLIC_POLYGON_MUMBAI_URL),
})

export const jsonRPCProviderGoerli = createPublicClient({
  chain: goerli,
  transport: http(process.env.NEXT_PUBLIC_GOERLI_URL),
})

export const jsonRPCProviderSepolia = createPublicClient({
  chain: sepolia,
  transport: http(process.env.NEXT_PUBLIC_SEPOLIA_URL),
})

export const jsonRPCProviderMainnet = createPublicClient({
  chain: mainnet,
  transport: http(process.env.NEXT_PUBLIC_MAINNET_URL),
})

export const jsonRPCProviderAvalancheMainnet = createPublicClient({
  chain: avalanche,
  transport: http(process.env.NEXT_PUBLIC_AVALANCHE_MAINNET_URL),
})

export const jsonRPCProviderAvalancheFuji = createPublicClient({
  chain: avalancheFuji,
  transport: http(process.env.NEXT_PUBLIC_AVALANCHE_FUJI_URL),
})

export const jsonRPCProviderArbitrumMainnet = createPublicClient({
  chain: arbitrum,
  transport: http(process.env.NEXT_PUBLIC_ARBITRUM_MAINNET_URL),
})

export const jsonRPCProviderArbitrumGoerli = createPublicClient({
  chain: arbitrumGoerli,
  transport: http(process.env.NEXT_PUBLIC_ARBITRUM_GOERLI_URL),
})

export const providerMap = {
  [polygonMumbai.id]: jsonRPCProvider,
  [avalancheFuji.id]: jsonRPCProviderAvalancheFuji,
  [sepolia.id]: jsonRPCProviderSepolia,
  [goerli.id]: jsonRPCProviderGoerli,
  [mainnet.id]: jsonRPCProviderMainnet,
  [avalanche.id]: jsonRPCProviderAvalancheMainnet,
  [arbitrum.id]: jsonRPCProviderArbitrumMainnet,
  [arbitrumGoerli.id]: jsonRPCProviderArbitrumGoerli,
}
/** */

export const forumContract = getContract({
  address: ForumContractAddress as `0x${string}`,
  abi: abi,
  publicClient: jsonRPCProvider,
}) as ForumContract

export const semaphoreContract = new SemaphoreEthers(process.env.NEXT_PUBLIC_POLYGON_MUMBAI_URL, {
  address: SemaphoreContractAddress,
})
