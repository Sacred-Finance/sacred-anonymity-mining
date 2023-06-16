import React, { ButtonHTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

const MotionButton = motion.button

export function CancelButton({
  children,
  ...rest
}: {
  children?: React.ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>): JSX.Element {
  return (
    // @ts-ignore
    <MotionButton
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={clsx(
        'border border-black px-4 py-2 text-sm text-black transition-colors duration-200 ease-in-out hover:bg-black hover:text-white dark:border-primary-border'
      )}
      {...rest}
    >
      {children}
    </MotionButton>
  )
}
