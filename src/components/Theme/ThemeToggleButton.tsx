import React, { useState, useEffect } from 'react'
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid'
import { useTheme } from 'next-themes'
import { AnimatePresence, motion } from 'framer-motion'

import { Button } from '@/shad/ui/button'
import { clsx } from 'clsx'

const iconVariants = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 20, opacity: 0 },
}

const MotionButton = motion(Button)
export const ThemeToggleButton = ({ noTabIndex = false }) => {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleClick = e => {
    e.preventDefault()
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light')
  }

  const oppositeThemeIcon =
    resolvedTheme === 'light' ? (
      <MoonIcon className="inline-block h-8 w-8 flex-shrink-0 text-blue-500" />
    ) : (
      <SunIcon className="h-8 w-8 flex-shrink-0 text-orange-600" />
    )

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="relative flex w-12 items-center "
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <MotionButton
        layoutId={'active'}
        whileHover={{ opacity: 0 }}
        className={clsx('z-[1] flex bg-transparent hover:bg-transparent items-center justify-center gap-1 text-xs p-0')}
        tabIndex={noTabIndex ? -1 : 0}
        onClick={handleClick}
      >
        {resolvedTheme === 'light' ? (
          <SunIcon className="h-8 w-8 flex-shrink-0 text-orange-600" />
        ) : (
          <MoonIcon className="inline-block h-8 w-8 flex-shrink-0 text-blue-500" />
        )}
      </MotionButton>
      <AnimatePresence>
        {isHovered && (
          <motion.span
            layoutId={'preview'}
            className="absolute left-0 top-0  flex h-full w-full items-center justify-center"
            variants={iconVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {oppositeThemeIcon}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
