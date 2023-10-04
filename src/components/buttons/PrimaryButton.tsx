import React, { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'
import { CircularLoader } from '@components/JoinCommunityButton'
import { toast } from 'react-toastify'
import { useTranslation } from 'next-i18next'
import ToolTip from '@components/HOC/ToolTip'

export type PrimaryButtonProps = {
  children?: React.ReactNode
  isLoading?: boolean
  isConnected?: boolean
  isJoined?: boolean
  requirements?: {
    needsConnected?: boolean
    needsJoined?: boolean
  }
  resetClasses?: boolean
  endIcon?: React.ReactNode
  startIcon?: React.ReactNode
  loadingPosition?: 'start' | 'end'
  toolTip?: string | boolean
} & ButtonHTMLAttributes<HTMLButtonElement>
export function PrimaryButton({
  children,
  isLoading,
  requirements,
  isConnected,
  isJoined,
  resetClasses,
  loadingPosition = 'end',
  ...rest
}: PrimaryButtonProps & ButtonHTMLAttributes<HTMLButtonElement>): JSX.Element {
  const { t } = useTranslation()
  const wrappedOnClick = e => {
    if (requirements?.needsConnected && !isConnected) {
      return toast.error(t('alert.connectWallet'), { toastId: 'connectWallet' })
    }
    if (requirements?.needsJoined && !isJoined) {
      return toast(t('alert.pleaseJoin'), { toastId: 'joinCommunity' })
    }
    if (rest.onClick) {
      rest.onClick(e)
    }
  }

  return (
    <ToolTip tooltip={rest?.toolTip || false}>
      <button
        {...rest}
        disabled={rest.disabled || isLoading}
        className={clsx(
          !resetClasses &&
            'rounded-lg border bg-primary-500 px-4 py-2 text-white shadow-md transition duration-150 ease-in-out hover:brightness-125 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-opacity-50 active:bg-primary-700 disabled:opacity-60',
          !resetClasses && 'flex items-center gap-2 disabled:cursor-not-allowed',
          rest.className
        )}
        onClick={wrappedOnClick}
      >
        {isLoading && loadingPosition === 'start' && <CircularLoader />}
        {rest.startIcon && !isLoading && loadingPosition === 'start' && rest.startIcon}
        {children}
        {rest.endIcon && !isLoading && loadingPosition === 'end' && rest.endIcon}
        {isLoading && loadingPosition === 'end' && <CircularLoader />}
      </button>
    </ToolTip>
  )
}
