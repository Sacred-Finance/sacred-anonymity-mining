// Web3 Configs
import { configureChains, createClient } from 'wagmi'
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
} from '@rainbow-me/rainbowkit/wallets'
import { app } from '@/appConfig'
import { connectorsForWallets } from '@rainbow-me/rainbowkit'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { publicProvider } from 'wagmi/providers/public'
import { ParticleNetwork } from '@particle-network/auth'
import { particleWallet } from '@particle-network/rainbowkit-ext'

export const stallTimeout = 10_0000

new ParticleNetwork({
  appId: process.env.NEXT_PUBLIC_PARTICLE_APP_ID || '',
  clientKey: process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY || '',
  projectId: process.env.NEXT_PUBLIC_PARTICLE_PROJECT_ID || '',
})

export const { chains, provider, webSocketProvider } = configureChains(
  [polygonMumbai],
  [
    alchemyProvider({
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY as string,
      stallTimeout,
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
            webSocket: process.env.NEXT_PUBLIC_LOCALHOST_URL ?? '',
          }
        } else if (chain.id === mainnet.id) {
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
      stallTimeout: stallTimeout,
    }),

    publicProvider({ stallTimeout: stallTimeout }),
  ],

  { stallTimeout: stallTimeout, pollingInterval: stallTimeout }
)
const otherWallets = [
  braveWallet({ chains }),
  // ledgerWallet({ chains }),
  particleWallet({ chains, authType: 'google' }),
  particleWallet({ chains, authType: 'facebook' }),
  particleWallet({ chains, authType: 'apple' }),
  particleWallet({ chains }),
  coinbaseWallet({ chains, appName: app.name }),
  // rainbowWallet({ chains }),
  //   walletConnectWallet({ chains }),
]
const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      injectedWallet({ chains, shimDisconnect: true }),
      metaMaskWallet({
        chains,
        shimDisconnect: true,
        walletConnectOptions: {
          showQrModal: true,
        },
        projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID,
      }),
    ],
  },
  {
    groupName: 'Other Wallets',
    wallets: otherWallets,
  },
])
export const client = createClient({
  autoConnect: true,
  provider: provider({ chainId: polygonMumbai.id }),
  webSocketProvider: webSocketProvider({ chainId: polygonMumbai.id }),
  connectors: connectors,
  logger: {
    warn: message => console.warn('Wagmi warning', message),
  },
})
