import { configureChains, createConfig } from 'wagmi'

import {
  goerli,
  localhost,
  mainnet,
  polygonMumbai,
  sepolia,
} from 'wagmi/chains'
import {
  braveWallet,
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { app } from '@/appConfig'
import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { ParticleNetwork } from '@particle-network/auth'
import { particleWallet } from '@particle-network/rainbowkit-ext'
import { publicProvider } from 'wagmi/providers/public'

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
          console.log('goerli', process.env.NEXT_PUBLIC_GOERLI_URL)
          return {
            http: process.env.NEXT_PUBLIC_GOERLI_URL ?? '',
            webSocket: process.env.NEXT_PUBLIC_LOCALHOST_URL ?? '',
          }
        } else if (chain.id === mainnet.id) {
          console.log('mainnet', process.env.NEXT_PUBLIC_MAINNET_URL)
          return {
            http: process.env.NEXT_PUBLIC_MAINNET_URL ?? '',
            webSocket: process.env.NEXT_PUBLIC_LOCALHOST_URL ?? '',
          }
        } else if (chain.id === polygonMumbai.id) {
          return {
            http: process.env.NEXT_PUBLIC_POLYGON_MUMBAI_URL ?? '',
            webSocket: process.env.NEXT_PUBLIC_LOCALHOST_URL ?? '',
          }
        } else if (chain.id === sepolia.id) {
          return {
            http: process.env.NEXT_PUBLIC_SEPOLIA_URL ?? '',
            webSocket: process.env.NEXT_PUBLIC_LOCALHOST_URL ?? '',
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
