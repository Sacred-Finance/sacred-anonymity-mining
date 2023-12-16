import React from 'react'
import { Logo } from './Logo'
import { NavBarButton } from '../components/buttons/NavBarButton'
import { ThemeToggleButton } from './Theme'
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  UserCircleIcon,
} from '@heroicons/react/20/solid'
import ConnectWallet from './Connect/ConnectWallet'
import { clsx } from 'clsx'
import { FaDiscord } from 'react-icons/fa'

const Header = () => {
  const [menuOpen, setMenuOpen] = React.useState(false)

  return (
    <nav
      id={'header'}
      className={clsx(
        'flex  bg-white p-4 text-gray-800 dark:bg-gray-900 dark:text-white',
        menuOpen
          ? 'items-between fixed inset-0 z-[41] flex flex-col justify-start gap-4'
          : 'relative items-center justify-between'
      )}
    >
      <div
        className={clsx(
          'flex w-full md:w-fit',
          menuOpen
            ? 'items-start justify-between'
            : 'items-center justify-between pt-1'
        )}
      >
        <NavBarButton href="/" className="">
          <div className="md:hidden">
            <Logo width={200} />
          </div>
          <div className="hidden md:block">
            <Logo />
          </div>
        </NavBarButton>

        <div className="flex items-center space-x-4 self-end sm:flex md:hidden ">
          {!menuOpen ? (
            <ArrowsPointingOutIcon
              className="h-8 w-8"
              onClick={() => setMenuOpen(!menuOpen)}
            />
          ) : (
            <ArrowsPointingInIcon
              className="h-8 w-8"
              onClick={() => setMenuOpen(!menuOpen)}
            />
          )}
        </div>
      </div>

      <div
        className={clsx(
          'flex items-center gap-4',
          menuOpen ? 'flex flex-wrap justify-center gap-4 ' : 'hidden md:flex'
        )}
      >
        <div className={'flex h-10 shrink-0 grow '}>
          <ConnectWallet />
        </div>
        <NavBarButton
          href="https://discord.com/channels/816041991502430218/829728678190907412"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center text-gray-600  hover:!text-purple-500 dark:text-gray-300"
        >
          <FaDiscord className="h-8 w-8" />
          <span className={'text-sm'}>Discord</span>
        </NavBarButton>
        <NavBarButton
          href="/account"
          className="flex flex-col items-center text-gray-600 hover:!text-purple-500 dark:text-gray-300"
        >
          <UserCircleIcon className="h-8 w-8" />
          <span className={'text-sm'}>Account</span>
        </NavBarButton>
        <ThemeToggleButton />
      </div>
    </nav>
  )
}

export default Header
