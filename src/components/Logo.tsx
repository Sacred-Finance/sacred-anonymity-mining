import logo from 'public/sacred-logos-wordmark.svg'
import logoLight from 'public/sacred-logos-wordmark-light.svg'
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
  const [mounted, setMounted] = React.useState(false)
  const { resolvedTheme } = useTheme()
  React.useEffect(() => setMounted(true), [])
  if (!mounted) {
    return null
  }
  return (
    <Image
      src={resolvedTheme === 'dark' || invertTheme ? logoLight : logo}
      width={width}
      alt={logo || 'logo'}
      className={className}
      unoptimized
      fetchPriority="high"
    />
  )
}
