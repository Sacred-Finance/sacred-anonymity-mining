import React, { ReactNode, useEffect, useRef, useState, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
type PredefinedColor = 'danger' | 'primary' | 'secondary' | 'warning' | 'info'

interface ToolTipProps {
  type: PredefinedColor
  title?: ReactNode
  message?: string
  children: ReactNode
}

export const ToolTip: React.ForwardRefExoticComponent<ToolTipProps & React.RefAttributes<HTMLDivElement>> = forwardRef(
  ({ type, title, message, children }, ref) => {
    const [isPopoverVisible, setIsPopoverVisible] = useState(false)

    const toolTipColorSchemes = {
      danger: 'bg-red-300 text-red-900 dark:bg-red-900 dark:text-red-300',
      primary: 'bg-blue-300 text-blue-900 dark:bg-blue-900 dark:text-blue-300',
      secondary: 'bg-green-300 text-green-900 dark:bg-green-900 dark:text-green-300',
      warning: 'bg-yellow-300 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-300',
      info: 'bg-gray-300 text-gray-900 dark:bg-gray-900 dark:text-gray-300',
    }

    const colors = toolTipColorSchemes[type] || toolTipColorSchemes.primary

    return (
      <div className={'group relative z-50'}>
        {children}

        <div
          className={clsx(
            'bg-opacity-85 absolute flex flex-col top-0 left-0 z-40 mt-10  hidden w-auto items-center  rounded-lg border  border-white/80 p-2 shadow group-hover:flex dark:border-black/80',
            colors
          )}
          role="alert"
        >
            {title && <div className="text-base font-normal  w-fit ml-3 text-inherit">{title}</div>}
            {message && <div className="ml-3 min-w-max text-sm font-normal">{message}</div>}
        </div>
      </div>
    )
  }
)

ToolTip.displayName = 'ToolTip'
