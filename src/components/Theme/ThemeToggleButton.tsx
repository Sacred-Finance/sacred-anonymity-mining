import React, { useEffect, useState } from 'react'
import { SunIcon } from '@heroicons/react/24/solid'
import { useTheme } from 'next-themes'
import { AnimatePresence, motion } from 'framer-motion'

import { Button } from '@/shad/ui/button'
import { clsx } from 'clsx'
import { BsMoonStarsFill } from 'react-icons/bs'

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

  if (!mounted) {
    return null
  }

  const handleClick = e => {
    e.preventDefault()
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light')
  }

  const oppositeThemeIcon =
    resolvedTheme === 'light' ? (
      <BsMoonStarsFill className="inline-block h-8 w-8 shrink-0 text-blue-500" />
    ) : (
      <SunIcon className="h-8 w-8 shrink-0 text-orange-600" />
    )

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="relative flex aspect-square h-14 w-14 items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <MotionButton
          layoutId="active"
          layoutRoot
          variant="link"
          variants={iconVariants}
          className={clsx(
            'group z-[1]  flex aspect-square h-full w-full flex-col items-center justify-center gap-24 bg-transparent p-0 text-xs ',
            isHovered ? '!opacity-0' : 'text-foreground/30'
          )}
          tabIndex={noTabIndex ? -1 : 0}
          onClick={handleClick}
        >
          {resolvedTheme === 'light' ? (
            <SunIcon className="h-8 w-8  shrink-0 rounded-full text-orange-500" />
          ) : (
            <BsMoonStarsFill className=" inline-block h-8 w-8  shrink-0  text-primary" />
          )}

          <span className="sr-only">Toggle dark mode</span>
        </MotionButton>
        {isHovered && (
          <motion.span
            layoutId="preview"
            className="absolute left-0 flex !aspect-square h-14 w-14 flex-wrap items-center justify-center rounded bg-primary/20 p-0.5"
            variants={iconVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <motion.span
              variants={iconVariants}
              className="flex  flex-col items-center  justify-center text-sm text-foreground "
            >
              {oppositeThemeIcon}
            </motion.span>
            {resolvedTheme === 'light' ? 'Dark' : 'Light'}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
