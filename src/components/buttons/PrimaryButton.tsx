import React, { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'
import { primaryButtonStyle } from '../../styles/classes'

export function PrimaryButton({
  children,
  ...rest
}: {
  children?: React.ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>): JSX.Element {
  return (
    <button {...rest} className={clsx(primaryButtonStyle, rest.className)}>
      {children}
    </button>
  )
}
