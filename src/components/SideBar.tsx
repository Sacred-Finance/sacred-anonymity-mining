import React from 'react'
import _ from 'lodash'
import Link from 'next/link'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon, HomeIcon, PlusCircleIcon } from '@heroicons/react/20/solid'
import ToolTip from '@components/HOC/ToolTip'
import { Avatar } from '@components/Avatar'
import { useUserIfJoined } from '@/contexts/CommunityProvider'
import { useRouter } from 'next/router'
import { User } from '@/lib/model'

export function SideItem({
  title,
  href,
  external = false,
  icon,
  isOpen,
  onClick,
}: {
  title: string
  href?: string | undefined
  external?: boolean
  icon: React.ReactNode
  isOpen: boolean
  onClick?: () => void | undefined
}) {
  const linkProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {}

  const active = useRouter().pathname === href

  return (
    <div className={clsx('group sticky top-0 w-full rounded bg-white dark:bg-gray-900')}>
      <ToolTip tooltip={!isOpen && title}>
        <Link
          href={(!onClick && href) || '/'}
          {...linkProps}
          className={clsx(
            'flex w-full items-center rounded md:p-3 shadow group-hover:bg-gray-200 dark:group-hover:bg-gray-800',
            isOpen ? 'gap-3' : 'flex-col gap-1',
            active && ' brightness-125'
          )}
          onClick={onClick}
        >
          <span className={clsx('h-6 w-6 rounded')}>{icon}</span>

          <span className={clsx('flex items-center text-sm ', isOpen ? 'text-sm' : 'hidden ')}>
            {_.startCase(title)}
          </span>
        </Link>
      </ToolTip>
    </div>
  )
}

export default function Sidebar({ isOpen, setIsOpen }) {
  const router = useRouter()
  const { groupId } = router.query
  const user = useUserIfJoined(groupId as string) as User

  return (
    <div className={'relative mr-1'}>
      <motion.aside
        initial={{ x: -100 }}
        animate={isOpen ? { x: 0 } : { x: 0 }}
        exit={{ x: -100 }}
        className={'sticky top-0 z-10 flex h-auto w-full flex-col dark:bg-gray-800 '}
      >
        <div className="flex w-full flex-col items-center">
          <ul className=" flex flex-col items-center gap-2 py-4 text-primary-600 ">
            <button onClick={() => setIsOpen(!isOpen)} className={clsx('flex w-full items-center justify-center')}>
              <ToolTip tooltip={isOpen ? 'Collapse' : 'Expand'}>
                {!isOpen ? (
                  <ChevronDoubleRightIcon className={'h-8 w-8'} />
                ) : (
                  <ChevronDoubleLeftIcon className={'h-8 w-8'} />
                )}
              </ToolTip>
            </button>

            <SideItem title={'home'} href={'/'} isOpen={isOpen} icon={<HomeIcon />} />
            <SideItem title={'New Community'} href={'/create-group'} isOpen={isOpen} icon={<PlusCircleIcon />} />
            <Avatar user={user?.identityCommitment?.toString()} />
          </ul>
        </div>
      </motion.aside>
    </div>
  )
}
