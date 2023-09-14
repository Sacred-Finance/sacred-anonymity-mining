import React, { useEffect, useState } from 'react'
import { useUserIfJoined } from '@/contexts/CommunityProvider'
import { useUnirepSignUp } from '@/hooks/useUnirepSignup'
import { User } from '@/lib/model'
import { useRouter } from 'next/router'
import { CircularLoader } from '@components/JoinCommunityButton'

// Tailwind CSS for simplicity
const cardClass = 'border border-blue-500 shadow rounded p-4 bg-white w-fit'
const cardTitleClass = 'text-blue-500 text-left font-bold text-lg flex gap-4 items-center'

const ReputationCard = () => {
  const router = useRouter()
  const { groupId } = router.query
  const user = useUserIfJoined(groupId as string)
  const unirepUser = useUnirepSignUp({ groupId: groupId, name: (user as User)?.name })
  const [reputation, setReputation] = useState({
    posRep: 0,
  })

  const [isLoading, setIsLoading] = useState(!!user)

  const asyncGetReputation = async () => {
    return unirepUser?.fetchReputation?.()
  }

  useEffect(() => {
    if (unirepUser) {
      setIsLoading(true)
      const interval = setInterval(async () => {
        const reputation = await asyncGetReputation()
        setReputation(reputation)
        if (unirepUser.hasReputationLoaded()) {
          clearInterval(interval)
          setIsLoading(false)
        }
      }, 5000)

      // Fetch the user's reputation once outside the interval if it's already loaded
      if (unirepUser.hasReputationLoaded()) {
        asyncGetReputation().then(reputation => {
          setReputation(reputation)
        })
        setIsLoading(false)
      }

      return () => clearInterval(interval)
    }
  }, [unirepUser])

  if (!reputation) return <div></div>
  return (
    <div className={cardClass}>
      <h2 className={cardTitleClass}>
        Your Reputation: {isLoading ? <CircularLoader /> : reputation.posRep || 0} Points{' '}
      </h2>
    </div>
  )
}

export default ReputationCard
