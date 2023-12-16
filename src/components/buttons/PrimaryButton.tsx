import type { ButtonHTMLAttributes } from 'react'
import React from 'react'
import { CircularLoader } from '@components/buttons/JoinCommunityButton'
import { toast } from 'react-toastify'
import { useTranslation } from 'next-i18next'
import { Button } from '@/shad/ui/button'

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
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
} & ButtonHTMLAttributes<HTMLButtonElement>
export function PrimaryButton({
  children,
  isLoading,
  requirements,
  isConnected,
  isJoined,
  loadingPosition = 'end',
  variant = 'default',
  ...rest
}: PrimaryButtonProps & ButtonHTMLAttributes<HTMLButtonElement>): JSX.Element {
  const { t } = useTranslation()
  const wrappedOnClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (requirements?.needsConnected && !isConnected) {
      return toast.error(t('alert.connectWallet'), { toastId: 'connectWallet' })
    }
    if (requirements?.needsJoined && !isJoined) {
      return toast(t('alert.pleaseJoin'), { toastId: 'joinCommunity' })
    }
    if (rest.onClick) {
      rest.onClick(e)
    }
    return null
  }

  // filter out props that are spreadable to the button
  const buttonProps = Object.fromEntries(
    Object.entries(rest).filter(
      ([key]) =>
        ![
          'toolTip',
          'requirements',
          'isConnected',
          'isJoined',
          'variant',
          'loadingPosition',
          'startIcon',
          'endIcon',
        ].includes(key)
    )
  )

  return (
    <Button
      variant={variant}
      {...buttonProps}
      disabled={rest.disabled || isLoading}
      onClick={wrappedOnClick}
    >
      {isLoading && loadingPosition === 'start' && <CircularLoader />}
      {rest.startIcon &&
        !isLoading &&
        loadingPosition === 'start' &&
        rest.startIcon}
      {children}
      {rest.endIcon && !isLoading && loadingPosition === 'end' && rest.endIcon}
      {isLoading && loadingPosition === 'end' && <CircularLoader />}
    </Button>
  )
}
