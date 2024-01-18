import { ParticleNetwork } from '@particle-network/auth'
import { particleWallet } from '@particle-network/rainbowkit-ext'
import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import {
  braveWallet,
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { configureChains, createConfig } from 'wagmi'
import { goerli, localhost, mainnet, polygon, polygonMumbai, sepolia } from 'wagmi/chains'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { publicProvider } from 'wagmi/providers/public'

import { app } from '@/appConfig'

export const stallTimeout = 10_0000

new ParticleNetwork({
  appId: process.env.NEXT_PUBLIC_PARTICLE_APP_ID || '',
  clientKey: process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY || '',
  projectId: process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID || '',
  chainId: polygonMumbai.id,
  chainName: 'Polygon',
})

export const { chains, publicClient, webSocketPublicClient } = configureChains(
  [polygonMumbai, goerli, mainnet, sepolia, localhost],
  [
    alchemyProvider({
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY as string,
    }),
    jsonRpcProvider({
      rpc: chain => {
        if (chain.id === localhost.id) {
          return {
            http: process.env.NEXT_PUBLIC_LOCALHOST_URL ?? '',
            webSocket: process.env.NEXT_PUBLIC_LOCALHOST_URL ?? '',
          }
        } else if (chain.id === goerli.id) {
          return {
            http: process.env.NEXT_PUBLIC_GOERLI_URL ?? '',
            webSocket: process.env.NEXT_PUBLIC_WS_GOERLI_URL ?? '',
          }
        } else if (chain.id === mainnet.id) {
          return {
            http: process.env.NEXT_PUBLIC_MAINNET_URL ?? '',
            webSocket: process.env.NEXT_PUBLIC_LOCALHOST_URL ?? '',
          }
        } else if (chain.id === polygon.id) {
          return {
            http: process.env.NEXT_PUBLIC_POLYGON_MUMBAI_URL ?? '',
            webSocket: process.env.NEXT_PUBLIC_WS_POLYGON_URL ?? '',
          }
        } else if (chain.id === polygonMumbai.id) {
          return {
            http: process.env.NEXT_PUBLIC_POLYGON_MUMBAI_URL ?? '',
            webSocket: process.env.NEXT_PUBLIC_WS_POLYGON_MUMBAI_URL ?? '',
          }
        } else if (chain.id === sepolia.id) {
          return {
            http: process.env.NEXT_PUBLIC_SEPOLIA_URL ?? '',
            webSocket: process.env.NEXT_PUBLIC_WS_SEPOLIA_URL ?? '',
          }
        }
        console.error(`No RPC URL for chain ${chain.name}`)
        return null
      },
    }),
    publicProvider(),
  ],

  {
    stallTimeout: stallTimeout,
    pollingInterval: stallTimeout,
    batch: { multicall: true },
    rank: true,
  }
)
const otherWallets = [
  braveWallet({ chains }),
  // ledgerWallet({ chains }),
  particleWallet({ chains, authType: 'google' }),
  particleWallet({ chains, authType: 'facebook' }),
  particleWallet({ chains, authType: 'apple' }),
  particleWallet({ chains }),
  coinbaseWallet({ chains, appName: app.name }),
  rainbowWallet({
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID as string,
    chains,
  }),
  //   walletConnectWallet({ chains }),
]
const connectors = () => {
  if (!process.env.NEXT_PUBLIC_WALLET_CONNECT_ID) {
    throw new Error('Missing NEXT_PUBLIC_WALLET_CONNECT_ID')
  }

  return connectorsForWallets([
    {
      groupName: 'Recommended',
      wallets: [
        injectedWallet({ chains, shimDisconnect: true }),
        metaMaskWallet({
          chains,
          shimDisconnect: true,
          projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID as string,
        }),
      ],
    },
    {
      groupName: 'Other Wallets',
      wallets: otherWallets,
    },
  ])
}
export const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient: webSocketPublicClient({ chainId: polygonMumbai.id }),
  connectors: connectors(),
  logger: {
    warn: message => console.warn('Wagmi warning', message),
  },
})
