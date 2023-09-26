import React, { useState } from 'react'
import _ from 'lodash'
import Link from 'next/link'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'next-i18next'
import {
  BugAntIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  HomeIcon,
  PlusCircleIcon,
} from '@heroicons/react/20/solid'
import ToolTip from '@components/HOC/ToolTip'
import { Avatar } from '@components/Avatar'
import { useUserIfJoined } from '@/contexts/CommunityProvider'
import { useRouter } from 'next/router'
import { User } from '@/lib/model'
import { PrimaryButton } from '@components/buttons'
import { BugModal } from '@components/BugModal'

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
    <div className={clsx('group sticky top-0 w-full rounded bg-white')}>
      <ToolTip tooltip={!isOpen && title}>
        <Link
          href={(!onClick && href) || '/'}
          {...linkProps}
          className={clsx(
            'flex w-full items-center rounded p-3 group-hover:bg-primary-100',
            isOpen ? 'gap-3' : 'flex-col gap-1',
            active && 'bg-primary-100'
          )}
          onClick={onClick}
        >
          <span className={clsx('h-6 w-6 rounded')}>{icon}</span>

          <span className={clsx('flex items-center text-sm font-medium', isOpen ? 'text-sm' : 'hidden ')}>
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

  const isMobile = window.innerWidth < 768

  return (
    <motion.aside
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5 }}
      exit={{ x: -100 }}
      className={'sticky top-4 z-10 flex h-auto w-full flex-col space-y-5'}
    >
      {/* Toggle Button for Mobile */}
      <div
        className={clsx(
          'flex w-full items-center justify-between rounded bg-gray-200 px-4 py-2 hover:bg-gray-300',
          isMobile ? 'block' : 'hidden'
        )}
      >
        <button onClick={() => setIsOpen(!isOpen)} className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300">
          {isOpen ? 'Close' : 'Menu'}
        </button>
      </div>

      <div className="flex w-full flex-col items-center">
        <ul className=" flex flex-col items-center gap-4 pt-5">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={clsx('flex w-full items-center justify-center text-primary-600 hover:bg-primary-100')}
          >
            <ToolTip tooltip={isOpen ? 'Collapse' : 'Expand'}>
              {!isOpen ? (
                <ChevronDoubleRightIcon className={'h-8 w-8'} />
              ) : (
                <ChevronDoubleLeftIcon className={'h-8 w-8'} />
              )}
            </ToolTip>
          </button>

          <SideItem
            title={'home'}
            href={'/'}
            isOpen={isOpen}
            icon={<HomeIcon className={clsx('text-primary-600')} />}
          />
          <BugModal />
          <SideItem
            title={'New Community'}
            href={'/create-group'}
            isOpen={isOpen}
            icon={<PlusCircleIcon className={'text-primary-600'} />}
          />
          <Avatar user={user?.identityCommitment?.toString()} />
        </ul>
      </div>
    </motion.aside>
  )
}
