import React, { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'
import Link, { LinkProps } from 'next/link'

import { primaryButtonStyle } from '../../styles/classes'

export function NavBarButton({
  href,
  children,
  ...rest
}: {
  href: string
  target?: string
  rel?: string
  children?: React.ReactNode
} & React.AnchorHTMLAttributes<HTMLAnchorElement> &
  Partial<typeof Link>): JSX.Element {
  return (
    <Link href={href} className={'flex items-center justify-center flex-col hover:text-primary'} {...rest}>
      {children}
    </Link>
  )
}
