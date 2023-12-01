import '@styles/style.scss'
import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import { app } from '@/appConfig'
import { useEffect, useRef } from 'react'
import HeadGlobal from '@/components/HeadGlobal'
import '../../i18n'

import { darkTheme, RainbowKitProvider, Theme } from '@rainbow-me/rainbowkit'
import { polygonMumbai } from 'wagmi/chains'
import { useAccount, WagmiConfig } from 'wagmi'
import { CommunityProvider } from '../contexts/CommunityProvider'
import { startIPFS } from '../lib/utils'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ErrorBoundary from '../components/ErrorBoundary'
import StandardLayout from '@components/HOC/StandardLayout'
import { merge } from 'lodash'
import { SWRProvider } from '@/contexts/SWRProvider'
import { chains, client } from '../../wagmi-config'
import { Orbis } from '@orbisclub/orbis-sdk'
import { randomSeed } from '@orbisclub/orbis-sdk/utils/index.js'
import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { ethers } from 'ethers'

function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute={'class'} defaultTheme={'dark'} storageKey={'theme-color'}>
      <Web3Wrapper>
        <HeadGlobal />
        <SWRProvider>
          <StandardLayout>
            <Component {...pageProps} />
            <ToastContainer />
          </StandardLayout>
        </SWRProvider>
      </Web3Wrapper>
    </ThemeProvider>
  )
}

export default App

const myTheme = merge(darkTheme(), {
  colors: {
    accentColor: '#07296d',
  },
} as Theme)

export function Web3Wrapper({ children }) {
  const didLoadRef = useRef(false)
  useEffect(() => {
    if (!didLoadRef.current) {
      startIPFS().then(() => (didLoadRef.current = true))
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
