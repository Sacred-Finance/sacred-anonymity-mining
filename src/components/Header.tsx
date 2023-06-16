import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { polygonMumbai } from 'wagmi/chains'

import { useIsMobile } from '../hooks/useIsMobile'
import { useTranslation } from 'next-i18next'
import { Logo, MobileLogo } from './Logo'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { ToolTip } from './HOC/ToolTip'
import { NavBarButton } from '../components/buttons/NavBarButton'
import { PrimaryButton } from '../components/buttons'
import { InjectedConnector } from '@wagmi/connectors/injected'
import { ThemeToggleButton } from './Theme'
import { HomeIcon, LockOpenIcon, QuestionMarkCircleIcon } from '@heroicons/react/20/solid'
import ConnectWallet from './Connect/ConnectWallet'

type HeaderProps = {
  createCommunity(): any
}

const Header = ({ createCommunity, ...headerProps }: HeaderProps) => {
  const { t } = useTranslation()
  const isMobile = useIsMobile()
  const { isConnected, address } = useAccount()
  // const { connect } = useConnect({
  //   chainId: polygonMumbai.id,
  //   connector: new MetaMaskConnector({
  //     options: {
  //       shimDisconnect: true,
  //       UNSTABLE_shimOnConnectSelectAccount: true,
  //     },
  //   }),
  //   onSuccess(data, variables, context) {
  //     console.log(data, variables, context);
  //   },
  //   onError(error, variables, context) {
  //     console.error(error, variables, context)
  //   }
  // });

  const { connect, connectors } = useConnect({
    connector: new InjectedConnector(),
  })
  const { disconnect } = useDisconnect()

  const onClickDisconnect = () => {
    disconnect()
  }
  return (
    <nav className="my-1 grid grid-cols-5 items-center gap-4 p-2 dark:bg-gray-900 ">
      <div className="flex items-center justify-start">
        <NavBarButton href="/" className=" ">
          {isMobile ? <MobileLogo /> : <Logo width={300} />}
        </NavBarButton>
      </div>

      <div className="col-span-3 flex items-center justify-evenly gap-3">
        <PrimaryButton onClick={createCommunity}>
          {isMobile ? <LockOpenIcon className="h-6 w-6" /> : t('toolTip.createCommunity')}
        </PrimaryButton>

        <ConnectWallet />
      </div>

      <div className="flex items-center justify-end gap-2">
        <NavBarButton href="https://www.thatsacred.place/help" target="_blank" rel="noopener noreferrer">
          <QuestionMarkCircleIcon className="w-8" />
        </NavBarButton>
        <ThemeToggleButton />
      </div>
    </nav>
  )
}

export default Header
