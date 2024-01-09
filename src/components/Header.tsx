import React from 'react'
import { Logo } from './Logo'
import { NavBarButton } from '../components/buttons/NavBarButton'
import { ThemeToggleButton } from './Theme'
import { UserCircleIcon } from '@heroicons/react/20/solid'
import ConnectWallet from './Connect/ConnectWallet'
import { FaDiscord, FaGripLines } from 'react-icons/fa'
import { useCommunityContext } from '@/contexts/CommunityProvider'
import { RiShieldUserFill } from 'react-icons/ri'
import { NavigationMenu } from '@/shad/ui/navigation-menu'
import { Button } from '@/shad/ui/button'
import { ExternalLinkIcon } from 'lucide-react'

function Gradients() {
  return (
    <>
      <svg
        style={{
          height: 0,
          width: 0,
          position: 'absolute',
        }}
        aria-hidden="true"
        focusable="false"
      >
        <linearGradient id="icon-gradient" x1="1" y1="1">
          <stop offset="10%" stopColor="currentColor" />
          <stop offset="60%" stopColor="#6D28D9" />
          <stop offset="80%" stopColor="#6D28D9" />
        </linearGradient>
      </svg>

      <svg
        style={{
          height: 0,
          width: 0,
          position: 'absolute',
        }}
        aria-hidden="true"
        focusable="false"
      >
        <linearGradient id="icon-gradient-discord" x1="1" y1="1">
          <stop offset="10%" stopColor="currentColor" />
          <stop offset="60%" stopColor="#6D28D9" />
          <stop offset="80%" stopColor="#7289DA" />
        </linearGradient>
      </svg>
    </>
  )
}

const Header = () => {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const {
    state: { isAdmin, isModerator },
  } = useCommunityContext()

  return (
    <NavigationMenu
      id="header"
      className={`w-full min-w-full overflow-x-hidden bg-white p-4 text-gray-800 dark:bg-gray-900 dark:text-white ${
        menuOpen ? 'fixed inset-0 z-[500] flex-col justify-between gap-4' : 'relative flex justify-between'
      }`}
    >
      <div className="flex w-full justify-between justify-self-start md:w-fit">
        <NavBarButton href="/">
          <Logo className="h-10 w-auto" />
        </NavBarButton>

        <Button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
          {menuOpen ? <FaGripLines className="h-8 w-8" /> : <FaGripLines className="h-8 w-8" />}
        </Button>
      </div>

      <div
        className={`gap-4 ${
          menuOpen ? ' flex flex-col items-center justify-center' : 'hidden md:flex md:items-center md:justify-between'
        }`}
      >
        <div className="h-10 shrink-0 grow md:flex md:items-center">
          <ConnectWallet />
        </div>

        <NavBarButton
          href="https://discord.com/channels/816041991502430218/829728678190907412"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative"
        >
          <FaDiscord className="h-8 w-8 group-hover:scale-105" />
          <div className=" flex h-fit items-center justify-center gap-1 md:text-sm">
            <span> Discord</span>
            <ExternalLinkIcon className="absolute   left-full top-1/3 -m-2 hidden h-1/3 -translate-y-1/2 overflow-visible rounded-full text-primary group-hover:block" />
          </div>
        </NavBarButton>
        <NavBarButton href="/account" className="group">
          <UserCircleIcon className="h-8 w-8 group-hover:scale-105" />
          <div className=" flex h-fit items-center justify-center gap-1 md:text-sm">
            <span> Account</span>
          </div>
        </NavBarButton>
        {isAdmin ||
          (isModerator && (
            <NavBarButton href="/admin" className="group">
              <RiShieldUserFill className="h-8 w-8 group-hover:scale-105" />
              <span className="mt-1 block text-center md:text-sm">Admin</span>
            </NavBarButton>
          ))}
        <div className="mt-4 flex items-center md:mt-0">
          <ThemeToggleButton />
        </div>
      </div>
      <div className="md:hidden" />
    </NavigationMenu>
  )
}

export default Header
