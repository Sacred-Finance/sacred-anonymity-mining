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
} & ButtonHTMLAttributes<HTMLButtonElement>

export function PrimaryButton({
  children,
  isLoading,

  requirements,
  isConnected,
  isJoined,

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
        primaryButtonStyle,
        rest.className,
        'flex cursor-pointer items-center gap-3 disabled:cursor-not-allowed disabled:opacity-50'
      )}
      onClick={wrappedOnClick}
    >
      {children} {isLoading && <CircularLoader />}
    </button>
  )
}
