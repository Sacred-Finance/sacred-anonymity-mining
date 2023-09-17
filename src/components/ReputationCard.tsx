import React, { useEffect, useState } from 'react'
import { useUserIfJoined } from '@/contexts/CommunityProvider'
import { useUnirepSignUp } from '@/hooks/useUnirepSignup'
import { User } from '@/lib/model'
import { useRouter } from 'next/router'
import { CircularLoader } from '@components/JoinCommunityButton'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { AnimatePresence, motion } from 'framer-motion'

const cardClass =
  'border-2 border-blue-600 shadow-lg rounded-lg  flex flex-col gap-2 p-4 relative justify-center items-center w-1/2 center overflow-hidden'
const cardTitleClass = 'text-blue-700 text-2xl font-semibold flex gap-4 items-center mb-4'
const cardLoadingIndicatorClass = 'w-4 h-4 absolute top-4 right-4 text-white'

interface UnirepUserStats {
  posRep: number
  negRep: number
  graffiti: number
  timestamp: number
}

const ReputationCard = () => {
  const router = useRouter()
  const { groupId } = router.query
  const user = useUserIfJoined(groupId as string)
  const unirepUser = useUnirepSignUp({ groupId: groupId, name: (user as User)?.name })
  const [reputation, setReputation] = useLocalStorage<UnirepUserStats | null>(`${groupId}-reputation`, '')
  const [lastUpdated, setLastUpdated] = useLocalStorage<Date | null>(`${groupId}-reputation-last-updated`, '')
  const [isUpdating, setIsUpdating] = useState(false)

  const asyncGetReputation = async (): Promise<UnirepUserStats> => {
    return unirepUser?.fetchReputation?.() as unknown as Promise<UnirepUserStats>
  }

  const shouldUpdate = () => {
    if (!lastUpdated) return true
    const minutesSinceLastUpdate = Math.floor((new Date().getTime() - new Date(lastUpdated).getTime()) / 60000)
    return minutesSinceLastUpdate >= 2
  }

  useEffect(() => {
    if (unirepUser) {
      const interval = setInterval(async () => {
        if (shouldUpdate()) {
          setIsUpdating(true)
          const newReputation = await asyncGetReputation()
          setReputation(newReputation)
          setLastUpdated(new Date())
          setIsUpdating(false)
        }
      }, 120000) // Update every 2 minutes

      return () => clearInterval(interval)
    }
  }, [unirepUser])

  const timeSinceLastUpdate = lastUpdated
    ? Math.round((new Date().getTime() - new Date(lastUpdated).getTime()) / 1000) // in seconds
    : null

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between">
        <h2 className={cardTitleClass}>Your Reputation</h2>
        {isUpdating && <CircularLoader className={cardLoadingIndicatorClass} />}
      </div>
      <p className="text-lg text-gray-700">{reputation?.posRep || 0} Points</p>
      {lastUpdated && <p className="text-sm text-gray-500">Last updated: {timeSinceLastUpdate} seconds ago</p>}
      {/*<TextComponent />*/}
    </div>
  )
}

export default ReputationCard

const TextComponent = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.2,
      },
    },
  }

  const titleVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  }

  const paragraphVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        damping: 5,
      },
    },
  }

  const listVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring',
        damping: 5,
      },
    },
  }

  return (
    <AnimatePresence>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className={'-mx-4 -mb-4 -z-2 text-white px-4  bg-gray-900 rounded-sm'}>
        <div className="justify-center text-center">
          <motion.h1 variants={titleVariants} className="text-3xl font-semibold ">
            What is reputation?
          </motion.h1>
          <div >
            <motion.p variants={paragraphVariants} className="text-start text-lg">
              Unirep is your ticket to a more secure and private online experience. Imagine proving your reputation
              without sacrificing your identity.
            </motion.p>

            <motion.p variants={paragraphVariants} className="text-start text-lg">
              SK-SNARK is the magic that makes it all happen. It prevents spam and safeguards the community, all while
              you remain anonymous.
            </motion.p>

            <motion.ul variants={containerVariants} className="list-inside list-disc text-start text-lg">
              <motion.li variants={listVariants}>
                Earn or lose reputation based on community feedback. Your contributions matter.
              </motion.li>
              <motion.li variants={listVariants}>High reputation? More privileges. Make your voice heard.</motion.li>
              <motion.li variants={listVariants}>
                Low reputation limits you, but it's never too late to improve.
              </motion.li>
              <motion.li variants={listVariants}>
                Negative reputation? You won't be able to contribute until you make amends.
              </motion.li>
            </motion.ul>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
