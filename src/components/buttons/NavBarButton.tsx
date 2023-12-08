import React from 'react'
import Link from 'next/link'

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
    <Link
      href={href}
      className={'flex flex-col items-center justify-center hover:text-primary'}
      {...rest}
    >
      {children}
    </Link>
  )
}
