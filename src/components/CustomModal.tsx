import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function CustomModal({
  isOpen,
  children,
  setIsOpen,
}: {
  isOpen: boolean
  children: React.ReactNode
  setIsOpen: any
}) {
  // on click outside of modal, close modal
  const ref = React.useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [ref])

  return (
    <AnimatePresence mode={'wait'}>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={'fixed inset-0 left-0 top-0 z-50 overflow-y-auto bg-black bg-opacity-50 '}
        >
          <div className={'absolute inset-0 flex items-center justify-center sm:px-0 sm:py-0 md:px-4 md:py-8'}>
            <motion.div
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.7 }}
              transition={{ duration: 0.5 }}
              className={'overflow-hidden rounded-lg bg-white sm:w-full  sm:max-w-full md:w-full md:max-w-2xl'}
              ref={ref}
            >
              {children}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
