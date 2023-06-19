import React, { ButtonHTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { buttonVariants, primaryButtonStyle } from '../../styles/classes'

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
      {...rest}
      className={clsx(rest.className, primaryButtonStyle, buttonVariants.error)}
    >
      {children}
    </MotionButton>
  )
}
