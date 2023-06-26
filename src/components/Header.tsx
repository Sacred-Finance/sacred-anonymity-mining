import { useIsMobile } from '../hooks/useIsMobile'
import { useTranslation } from 'next-i18next'
import { DynamicLogo, MobileLogo } from './Logo'
import { NavBarButton } from '../components/buttons/NavBarButton'
import { PrimaryButton } from '../components/buttons'
import { ThemeToggleButton } from './Theme'
import { HomeIcon, LockOpenIcon, QuestionMarkCircleIcon } from '@heroicons/react/20/solid'
import ConnectWallet from './Connect/ConnectWallet'
import React from 'react'

type HeaderProps = {
  createCommunity(): any
}

const Header = ({ createCommunity, ...headerProps }: HeaderProps) => {
  const { t } = useTranslation()
  const isMobile = useIsMobile()

  return (
    <nav className="my-1 grid grid-cols-5 items-center gap-4 p-2 dark:bg-gray-900">
      <div className="flex items-center justify-start">
        <NavBarButton href="/" className="h-10">
          {isMobile ? <MobileLogo /> : <DynamicLogo className={'h-10 w-[45%]'} />}
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
