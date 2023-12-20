import '@styles/style.scss'
import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import { app } from '@/appConfig'
import { useEffect, useRef } from 'react'
import HeadGlobal from '@/components/HeadGlobal'
import '../../i18n'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { providerChainId } from '../constant/const'
import { connectorsForWallets, darkTheme, RainbowKitProvider, Theme } from '@rainbow-me/rainbowkit'
import { braveWallet, coinbaseWallet, injectedWallet, metaMaskWallet } from '@rainbow-me/rainbowkit/wallets'
import { goerli, localhost, mainnet, optimismGoerli, arbitrumGoerli, polygonMumbai, sepolia } from 'wagmi/chains'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { CommunityProvider } from '../contexts/CommunityProvider'
import { startIPFS } from '../lib/utils'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ErrorBoundary from '../components/ErrorBoundary'
import { SWRConfig } from 'swr'
import StandardLayout from '@components/HOC/StandardLayout'
import { merge } from 'lodash'

function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute={'class'} defaultTheme={'dark'} storageKey={'theme-color'}>
      <Web3Wrapper>
        <HeadGlobal />
        <SWRConfig
          value={{
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            fetcher: (resource, init) =>
              fetch(resource, init).then(res => {
                return res.json()
              }),
          }}
        >
          <StandardLayout>
            <Component {...pageProps} />
            <ToastContainer />
          </StandardLayout>
        </SWRConfig>
      </Web3Wrapper>
    </ThemeProvider>
  )
}

export default App

// Web3 Configs
const stallTimeout = 10_0000
const { chains, provider, webSocketProvider } = configureChains(
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
        } else if (chain.id === optimismGoerli.id) {
          return {
            http: process.env.NEXT_PUBLIC_OPTIMISM_GOERLI_URL ?? '',
            webSocket: process.env.NEXT_PUBLIC_LOCALHOST_URL ?? '',
          }
        } else if (chain.id === arbitrumGoerli.id) {
          return {
            http: process.env.NEXT_PUBLIC_ARBITRUM_GOERLI_URL ?? '',
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
  provider: provider({ chainId: providerChainId }),
  webSocketProvider: webSocketProvider({ chainId: providerChainId }),
  connectors: connectors,
  logger: {
    warn: message => console.warn('Wagmi warning', message),
  },
})

const myTheme = merge(darkTheme(), {
  colors: {
    accentColor: '#07296d',
  },
} as Theme)

// Web3Wrapper
export function Web3Wrapper({ children }) {
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
        initialChain={providerChainId} // Optional, initialChain={1}, initialChain={chain.mainnet}, initialChain={gnosisChain}
        showRecentTransactions={false}
        theme={myTheme}
        id={'rainbowkit'}
      >
        <CommunityProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
        </CommunityProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
