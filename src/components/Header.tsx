import React from 'react'
import { useTranslation } from 'next-i18next'
import { DynamicLogo, Logo } from './Logo'
import { NavBarButton } from '../components/buttons/NavBarButton'
import { ThemeToggleButton } from './Theme'
import { ArrowLeftIcon, PlusCircleIcon, QuestionMarkCircleIcon } from '@heroicons/react/20/solid'
import ConnectWallet from './Connect/ConnectWallet'
import Link from 'next/link'

const Header = () => {
  const { t } = useTranslation()

  const [menuOpen, setMenuOpen] = React.useState(false)

  return (
    <nav
      id={'header'}
      className="flex items-center justify-between p-4 text-gray-800 dark:bg-gray-900 dark:text-white "
    >
      <div className="flex items-center space-x-4">
        <NavBarButton href="/" className="">
          <div className="md:hidden">
            <Logo />
          </div>
          <div className="hidden md:block">
            <Logo className="h-[64px] w-[150px]" />
          </div>
        </NavBarButton>
      </div>

      <div className="items-center space-x-4 sm:hidden md:flex">
        <ConnectWallet />
        <NavBarButton
          href="https://www.thatsacred.place/help"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 dark:text-gray-300"
        >
          <QuestionMarkCircleIcon className="h-8 w-8" />
        </NavBarButton>
        <ThemeToggleButton />
      </div>

      {menuOpen && (
        <>
          <ConnectWallet />
          <NavBarButton
            href="https://www.thatsacred.place/help"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-300"
          >
            <QuestionMarkCircleIcon className="h-8 w-8" />
          </NavBarButton>
          <ThemeToggleButton />
        </>
      )}

      {!menuOpen && (
        <div className="flex items-center space-x-4 sm:flex md:hidden">
          <ArrowLeftIcon className="h-8 w-8" onClick={() => setMenuOpen(true)} />
        </div>
      )}
    </nav>
  )
}

export default Header
