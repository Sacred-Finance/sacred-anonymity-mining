import '@styles/style.scss'
import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import { useRouter } from 'next/router'
import { useTheme } from 'next-themes'
import { app } from '@/appConfig'
import { useState, useEffect, useRef } from 'react'
import HeadGlobal from '@/components/HeadGlobal'
import '../../i18n'
import { alchemyProvider } from 'wagmi/providers/alchemy'

import { connectorsForWallets, RainbowKitProvider, lightTheme, darkTheme } from '@rainbow-me/rainbowkit'
import { injectedWallet, metaMaskWallet, braveWallet, coinbaseWallet } from '@rainbow-me/rainbowkit/wallets'
import { mainnet, polygonMumbai, localhost, goerli, sepolia, avalancheFuji } from 'wagmi/chains'
import { createClient, configureChains, WagmiConfig } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { LoaderProvider } from '../contexts/LoaderContext'
import { CommunityProvider, useCommunities, useCommunityContext } from '../contexts/CommunityProvider'
import { startIPFS } from '../lib/utils'
import { useFetchCommunities } from '../hooks/useFetchCommunities'
import { useFetchUsers } from '../hooks/useFetchUsers'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import LoadingPage from '../components/LoadingComponent'
import ErrorBoundary from '../components/ErrorBoundary'
import { useMounted } from '@/hooks/useMounted'

function App({ Component, pageProps }: AppProps) {
  return (
    <LoaderProvider>
      <Web3Wrapper>
        <HeadGlobal />
        <Component {...pageProps} />
        <ToastContainer />
      </Web3Wrapper>
    </LoaderProvider>
  )
}
export default App

// Web3 Configs
const stallTimeout = 10_0000
const { chains, provider, webSocketProvider } = configureChains(
  [polygonMumbai, sepolia, avalancheFuji, goerli],
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
        } else if (chain.id === avalancheFuji.id) {
          return {
            http: process.env.NEXT_PUBLIC_AVALANCHE_FUJI_URL ?? '',
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
  coinbaseWallet({ chains, appName: app.name }),
  // rainbowWallet({ chains }),
  //   walletConnectWallet({ chains }),
]

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [injectedWallet({ chains, shimDisconnect: true }), metaMaskWallet({ chains, shimDisconnect: true })],
  },
  {
    groupName: 'Other Wallets',
    wallets: otherWallets,
  },
])

const client = createClient({
  autoConnect: true,
  provider: provider({ chainId: polygonMumbai.id }),
  webSocketProvider: webSocketProvider({ chainId: polygonMumbai.id }),
  connectors: connectors,
  logger: console,
})
// Web3Wrapper
export function Web3Wrapper({ children }) {
  const { resolvedTheme } = useTheme()

  const didLoadRef = useRef(false)
  useEffect(() => {
    if (didLoadRef.current === false) {
      didLoadRef.current = true
      startIPFS()
    }
  }, [])

  return (
    <WagmiConfig client={client}>
      <RainbowKitProvider
        appInfo={{
          appName: app.name,
          learnMoreUrl: app.url,
        }}
        chains={chains}
        initialChain={polygonMumbai.id} // Optional, initialChain={1}, initialChain={chain.mainnet}, initialChain={gnosisChain}
        showRecentTransactions={false}
        theme={resolvedTheme === 'dark' ? darkTheme() : lightTheme()}
        id={'rainbowkit'}
      >
        <CommunityProvider>
          <InitialLoad>
            <ErrorBoundary>{children}</ErrorBoundary>
          </InitialLoad>
        </CommunityProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}

const InitialLoad = ({ children }) => {
  useFetchCommunities()
  useFetchUsers()
  const communities = useCommunities()

  const isMounted = useMounted()

  if (communities === null || communities?.length === 0 || !isMounted) {
    return <LoadingPage />
  }

  return <>{children}</>
}
