import React, { useState } from 'react'
import _ from 'lodash'
import Link from 'next/link'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'next-i18next'
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon, HomeIcon, PlusCircleIcon } from '@heroicons/react/20/solid'
import ToolTip from '@components/HOC/ToolTip'

function SideItem({ title, href, external = false, icon, indent, isOpen }) {
  const linkProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {}

  return (
    <ToolTip tooltip={!isOpen && _.startCase(title)}>
      <div className={clsx('group sticky top-0 w-full rounded bg-white')}>
        <Link
          href={href || '/'}
          {...linkProps}
          className={clsx(
            'flex w-full items-center rounded p-3 group-hover:bg-primary-100',
            isOpen ? 'gap-3' : 'flex-col items-center justify-center'
          )}
        >
          <span className={clsx('h-6 w-6 rounded')}>{icon}</span>

          <span className={clsx('flex items-center text-sm font-medium', isOpen ? 'text-sm' : 'hidden ')}>
            {_.startCase(title)}
          </span>
        </Link>
      </div>
    </ToolTip>
  )
}

export default function Sidebar({ isOpen, setIsOpen }) {
  return (
    <motion.aside
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5 }}
      exit={{ x: -100 }}
      className={'sticky top-4 w-full space-y-5'}
    >
      <div className="flex w-full flex-col items-center ">
        <ul className="relative flex flex-col gap-4 pt-5">
          <ToolTip tooltip={isOpen ? 'Collapse' : 'Expand'}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={clsx(
                'flex  w-full items-center justify-center   text-primary-600 hover:bg-primary-100'
              )}
            >
              {!isOpen ? (
                <ChevronDoubleRightIcon className={'h-8 w-8'} />
              ) : (
                <ChevronDoubleLeftIcon className={'h-8 w-8'} />
              )}
            </button>
          </ToolTip>
          <SideItem
            title={'home'}
            href={'/'}
            isOpen={isOpen}
            icon={<HomeIcon className={clsx('text-primary-600')} />}
          />
          <SideItem
            title={'New Community'}
            href={'/create-group'}
            isOpen={isOpen}
            icon={<PlusCircleIcon className={'text-primary-600'} />}
          />
        </ul>
      </div>
    </motion.aside>
  )
}
