import React from 'react'
import Link from 'next/link'
import { cn } from '@/shad/lib/utils'

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
      {...rest}
      className={cn(
        'flex items-center  justify-center gap-4  self-center hover:text-primary md:flex-col md:gap-0',
        rest.className
      )}
    >
      {children}
    </Link>
  )
}
