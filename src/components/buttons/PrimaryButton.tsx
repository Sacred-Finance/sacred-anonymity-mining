import React, { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'
import { primaryButtonStyle } from '../../styles/classes'
import { CircularProgress } from '@components/CircularProgress'
import { CircularLoader } from '@components/JoinCommunityButton'

export function PrimaryButton({
  children,
  isLoading,
  ...rest
}: {
  children?: React.ReactNode
  isLoading?: boolean
} & ButtonHTMLAttributes<HTMLButtonElement>): JSX.Element {
  return (
    <button {...rest} disabled={rest.disabled || isLoading} className={clsx(primaryButtonStyle, rest.className, 'flex items-center gap-3')}>
      {children} {isLoading && <CircularLoader />}
    </button>
  )
}
