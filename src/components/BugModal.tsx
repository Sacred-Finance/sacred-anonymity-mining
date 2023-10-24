import React, { useState } from 'react'
import { CustomModal } from '@components/CustomModal'
import { BugAntIcon, ExclamationCircleIcon, HandRaisedIcon } from '@heroicons/react/20/solid'
import { SideItem } from '@components/SideBar'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { PrimaryButton } from './buttons/PrimaryButton'

export const GithubIcon = ({ className }) => (
  <svg
    height="128"
    aria-hidden="true"
    viewBox="0 0 16 16"
    version="1.1"
    width="128"
    data-view-component="true"
    className={clsx('octicon octicon-mark-github v-align-middle color-fg-default', className)}
  >
    <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
  </svg>
)
export const BugModal = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  const bugVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  if (isOpen)
    return (
      <CustomModal isOpen={isOpen} setIsOpen={setIsOpen}>
        <motion.div
          className={
            'aspect-1/2 group relative flex h-[600px] select-none flex-col items-center  justify-center gap-4 rounded-lg bg-white p-32 transition-all hover:bg-primary-500 sm:w-full'
          }
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <h1
            className={clsx(
              'items-center justify-center text-center  align-middle text-2xl font-bold text-primary-800 transition-all duration-0',
              isHovering ? 'opacity-0' : 'text-primary-800'
            )}
          >
            <div className={'flex items-center gap-2'}>
              Find a bug? <ExclamationCircleIcon className={'h-6 w-6'} />
            </div>
          </h1>
          <div className={clsx(isHovering ? 'md:text-white' : 'md:opacity-0')}>Click below to create a ticket</div>

          <a
            target={'_blank'}
            rel={'noopener noreferrer'}
            href={'https://github.com/Sacred-Finance/sacred-community-client-nextjs/issues'}
            className={
              'flex flex-col items-center gap-2 rounded-lg border-2 border-transparent px-2 shadow hover:bg-primary-400 hover:shadow-2xl group-hover:border-white '
            }
          >
            <motion.span
              className="text-white"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              Click here and create a ticket
            </motion.span>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={bugVariants}
              transition={{ duration: 0.3 }}
              className={'rounded-lg p-2'}
            >
              <BugAntIcon className={'h-40 fill-primary-800 text-white '} />
            </motion.div>
            <motion.div
              style={{ top: '75%' }}
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: isHovering ? 1 : 0,
                y: isHovering ? '-175%' : '250%',
              }}
              exit={{
                opacity: 0,
              }}
              transition={{ duration: 0.15 }}
              className={'absolute flex flex-col items-center gap-2 text-white'}
            >
              <GithubIcon className={'h-10 w-10 fill-white'} />
              Github
            </motion.div>
          </a>
          <div>Internal use only</div>
        </motion.div>
      </CustomModal>
    )

  return (
    <div className={'sm:fixed sm:bottom-0 md:flex'}>
      <PrimaryButton
        toolTip={'Found a bug?'}
        onClick={e => {
          setIsOpen(true)
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        {' '}
        <BugAntIcon className={'w-5 text-primary-600'} />
      </PrimaryButton>
    </div>
  )
}
