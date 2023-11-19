import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'

export function CustomModal({
  isOpen,
  children,
  setIsOpen,
  className,
}: {
  isOpen: boolean
  children: React.ReactNode
  setIsOpen: any
  className?: string
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
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
          transition={{ duration: 0.1 }}
          className={clsx('fixed  inset-0 left-0 top-0 z-10 overflow-y-auto bg-black bg-opacity-50', className)}
        >
          <div className={'absolute inset-0 flex items-center justify-center sm:px-0 sm:py-0 md:px-4 md:py-8'}>
            <motion.div
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.7 }}
              transition={{ duration: 0.2 }}
              ref={ref}
            >
              <div className={'flex justify-end bg-transparent '}>
                <button onClick={() => setIsOpen(false)} className={clsx()}>
                  <XMarkIcon
                    className={'h-6 w-6 text-white transition-all duration-700 group-hover:rotate-[240deg] '}
                  />
                </button>
              </div>

              {children}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
