import React from 'react'
import { Logo } from './Logo'
import { NavBarButton } from '../components/buttons/NavBarButton'
import { ThemeToggleButton } from './Theme'
import {
  ArrowLeftIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/20/solid'
import ConnectWallet from './Connect/ConnectWallet'
import clsx from 'clsx'

const Header = () => {
  const [menuOpen, setMenuOpen] = React.useState(false)

  return (
    <nav
      id={'header'}
      className={clsx(
        'flex  p-4 text-gray-800 dark:bg-gray-900 dark:text-white',
        menuOpen
          ? 'fixed inset-0 z-50 flex flex-col items-center justify-evenly bg-gray-900/50 p-12 '
          : 'relative items-center justify-between'
      )}
    >
      <div className="flex items-center justify-between space-x-4">
        <NavBarButton href="/" className="">
          <div className="md:hidden">
            <Logo />
          </div>
          <div className="hidden md:block">
            <Logo className="h-[64px] w-[150px]" />
          </div>
        </NavBarButton>

        <div className="flex items-center space-x-4 sm:flex md:hidden">
          {!menuOpen ? (
            <ArrowsPointingOutIcon className="h-8 w-8" onClick={() => setMenuOpen(!menuOpen)} />
          ) : (
            <ArrowsPointingInIcon className="h-8 w-8" onClick={() => setMenuOpen(!menuOpen)} />
          )}
        </div>
      </div>
      <div className={clsx('flex items-center gap-2', menuOpen ? 'flex gap-4' : 'hidden md:flex')}>
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
    </nav>
  )
}

export default Header
