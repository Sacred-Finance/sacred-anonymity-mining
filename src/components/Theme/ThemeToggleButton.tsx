import React from 'react'
import { useState, useEffect } from 'react'
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid'
import { useTheme } from 'next-themes'
import clsx from 'clsx'

import { primaryButtonStyle } from '../../styles/classes'

export const ThemeToggleButton = ({ noTabIndex = false }) => {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <button
      className={clsx('group relative  !text-purple-500')}
      tabIndex={noTabIndex ? -1 : 0}
      onClick={e => {
        e.preventDefault()
        setTheme(resolvedTheme === 'light' ? 'dark' : 'light')
      }}
    >
      {resolvedTheme === 'light' ? (
        <MoonIcon className="inline-block h-8 w-8  group-hover:text-yellow-500" />
      ) : (
        <SunIcon className="h-8 w-8 group-hover:text-red-400" />
      )}
    </button>
  )
}
