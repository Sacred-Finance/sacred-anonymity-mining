import React, { ReactNode, useState } from 'react'
import { motion } from 'framer-motion'
import { TbGridDots } from 'react-icons/tb'
import { Bars2Icon } from '@heroicons/react/20/solid'
import clsx from 'clsx'

export interface ActionItem {
  icon: ReactNode
  label: ReactNode // This can be an SVG or any other visual React component
  onClick: () => void
}

export interface SpeedDialProps {
  actions: (ActionItem | false)[]
  onHover?: (e) => React.MouseEvent<HTMLButtonElement, MouseEvent>
  onOpen?: () => void
}

export const SpeedDial: React.FC<SpeedDialProps> = ({ actions, onHover, onOpen }) => {
  const [isOpen, setIsOpen] = useState(false)

  actions = actions.filter(Boolean) as ActionItem[]

  return (
    <div className="group absolute right-0 top-0 z-50">
      <motion.button
        onMouseEnter={onHover}
        onMouseLeave={!isOpen ? onHover : undefined}
        type="button"
        aria-controls="speed-dial-menu-square"
        aria-expanded={isOpen}
        onClick={() => {
          if (actions.length) setIsOpen(!isOpen)
          onOpen && onOpen()
        }}
      >
        {isOpen ? (
          <Bars2Icon className={'h-6 w-6 text-gray-700 dark:text-gray-300 dark:group-hover:text-white'} />
        ) : (
          <TbGridDots className={'h-6 w-6 text-gray-700 dark:text-gray-300 dark:group-hover:text-white'} />
        )}
        <span className="sr-only">Open actions menu</span>
      </motion.button>

      <div
        id="speed-dial-menu-square"
        className={clsx(
          `flex flex-col items-center ${
            isOpen ? '' : 'hidden'
          } absolute right-0 mb-4 space-y-2 rounded-lg bg-black/50 p-4 shadow-lg `,
          !actions.length && 'hidden'
        )}
      >
        {actions.map((action, index) => (
          <React.Fragment key={index}>
            <button
              type="button"
              onClick={action.onClick}
              className="dark:hover:border-gray-500 flex w-full items-center space-x-3 rounded-lg border border-gray-200 bg-gradient-to-r from-gray-100 to-white p-2 shadow-sm transition-all duration-300 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:hover:bg-gray-700 dark:focus:ring-blue-500"
            >
              <span className="font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
              <span className="ml-auto">{action.icon}</span>
            </button>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
