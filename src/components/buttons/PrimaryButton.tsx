import React, { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'
import { primaryButtonStyle } from '../../styles/classes'
import { CircularProgress } from '@components/CircularProgress'
import { CircularLoader } from '@components/JoinCommunityButton'
import { toast } from 'react-toastify'
import { useTranslation } from 'next-i18next'

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
} & ButtonHTMLAttributes<HTMLButtonElement>

export function PrimaryButton({
  children,
  isLoading,
  requirements,
  isConnected,
  isJoined,
  resetClasses,
  ...rest
}: PrimaryButtonProps & ButtonHTMLAttributes<HTMLButtonElement>): JSX.Element {
  const { t } = useTranslation()
  const wrappedOnClick = e => {
    if (requirements?.needsConnected) {
      if (!isConnected) {
        return toast.error(t('alert.connectWallet'), { toastId: 'connectWallet' })
      }
    }
    if (requirements?.needsJoined) {
      if (!isJoined) {
        return toast(t('alert.pleaseJoin'), { toastId: 'joinCommunity' })
      }
    }
    if (rest.onClick) {
      rest.onClick(e)
    }
  }
  return (
    <button
      {...rest}
      disabled={rest.disabled || isLoading}
      className={clsx(
        !resetClasses && primaryButtonStyle,
        !resetClasses && 'flex items-center gap-3  disabled:opacity-50',
        'cursor-pointer disabled:cursor-not-allowed',
        rest.className
      )}
      onClick={wrappedOnClick}
    >
      {children} {isLoading && <CircularLoader />}
    </button>
  )
}
