import { AnimatePresence, motion } from 'framer-motion'
import { GiCancel } from 'react-icons/gi'
import { FaMagnifyingGlass } from 'react-icons/fa6'
import React from 'react'

const animationVariants = {
  initial: {
    opacity: 0,
    scale: 0.8,
    y: '-100%',
    transition: { duration: 0.2 },
  },
  animate: { opacity: 1, scale: 1, y: '0%', transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.8, y: '100%', transition: { duration: 0.2 } },
}

const transition = { duration: 0.2 }

export const SearchBar = ({ searchTerm, debouncedResults }) => {
  const inputRef = React.useRef<HTMLInputElement>(null)
  return (
    <div className="form-input flex h-10 w-full items-center  rounded hover:shadow-md  dark:bg-gray-900 dark:text-white">
      <div className={'flex justify-center p-3'}>
        <AnimatePresence mode={'popLayout'}>
          {searchTerm ? (
            <motion.button
              key={'cancel'}
              variants={animationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
              disabled={!searchTerm}
              onClick={() => {
                if (inputRef.current) {
                  inputRef.current.value = ''
                }
                debouncedResults({ target: { value: '' } })
              }}
            >
              <GiCancel className="h-4 w-6 text-black dark:text-inherit" />
            </motion.button>
          ) : (
            <motion.div
              key={'search'}
              variants={animationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transition}
            >
              <FaMagnifyingGlass className="h-4 w-6 text-black dark:text-inherit" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <input
        ref={inputRef}
        id="search"
        name="search"
        className="col-span-6 flex h-full w-full rounded border-0  bg-transparent text-black outline-0 focus:select-none focus:outline-none focus:ring-0 dark:text-inherit"
        onChange={debouncedResults}
        type="text"
        placeholder="Explore"
      />
    </div>
  )
}
