import logo from '../../public/sacred-logos-wordmark.svg'
import logoLight from '../../public/sacred-logos-wordmark-light.svg'
import mobileLogo from '../../public/logo.svg'
import React from 'react'
import Image from 'next/image'
import { useTheme } from 'next-themes'

export const Logo = ({
  invertTheme = false,
  className,
  width = 200,
}: {
  invertTheme?: boolean
  className?: string
  width?: number
}) => {
  const { resolvedTheme } = useTheme()
  return (
    <Image
      src={resolvedTheme === 'dark' || invertTheme ? logoLight : logo}
      width={width}
      alt={logo || 'logo'}
      className={className}
      unoptimized
      fetchPriority={'high'}
    />
  )
}

export const MobileLogo = (props: any) => {
  return <Image unoptimized src={mobileLogo} className={'w-8'} alt={logo} {...props} />
}
