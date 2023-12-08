import React, { useEffect, useState } from 'react'
import { useUserIfJoined } from '@/contexts/CommunityProvider'
import { useUnirepSignUp } from '@/hooks/useUnirepSignup'
import type { User } from '@/lib/model'
import { useRouter } from 'next/router'
import { CircularLoader } from '@components/buttons/JoinCommunityButton'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { motion } from 'framer-motion'

const cardClass =
  'border-2 border-primary shadow-lg rounded-lg  flex flex-col gap-2 p-4 relative justify-center items-center w-full center overflow-hidden'
const cardTitleClass =
  'text-white-700 text-xl font-semibold flex gap-4 items-center leading-none'
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
  const unirepUser = useUnirepSignUp({
    groupId: groupId,
    name: (user as User)?.name,
  })
  const [reputation, setReputation] = useLocalStorage<UnirepUserStats | null>(
    `${groupId}-reputation`,
    ''
  )
  const [lastUpdated, setLastUpdated] = useLocalStorage<Date | null>(
    `${groupId}-reputation-last-updated`,
    ''
  )
  const [isUpdating, setIsUpdating] = useState(false)

  const asyncGetReputation = async (): Promise<UnirepUserStats> => {
    return unirepUser?.fetchReputation?.() as unknown as Promise<UnirepUserStats>
  }

  const shouldUpdate = () => {
    if (!lastUpdated) {
      return true
    }
    const minutesSinceLastUpdate = Math.floor(
      (new Date().getTime() - new Date(lastUpdated).getTime()) / 60000
    )
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

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between">
        <h3 className={cardTitleClass}>Your Reputation</h3>
        {isUpdating && <CircularLoader className={cardLoadingIndicatorClass} />}
        <p className="pl-3 text-lg leading-none text-gray-700">
          {reputation?.posRep || 0} Points
        </p>
      </div>
      {/* {lastUpdated && <p className="text-sm text-gray-500">Last updated: {timeSinceLastUpdate} seconds ago</p>} */}
      {/*<TextComponent />*/}
    </div>
  )
}

export default ReputationCard
