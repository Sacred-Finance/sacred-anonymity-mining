import { JoinCommunityButton } from '../JoinCommunityButton'
import React from 'react'
import { useLocalCommunity } from './CommunityCard'
import { LeaveCommunityButton } from '../LeaveCommunityButton'
import { useUserIfJoined } from '@/contexts/CommunityProvider'

export const CommunityCardFooter = () => {
  const community = useLocalCommunity()

  
  if (!community) return null
  const hasUserJoined = useUserIfJoined(community.groupId as string)

  return (
    <div className="flex items-center justify-end rounded-b-lg bg-white p-4 dark:bg-gray-900 ">
      <div>
        {community ? (
          <React.Fragment>
            {!hasUserJoined ? (
              <JoinCommunityButton community={community} hideIfJoined={community.variant === 'banner'} />
            ) : (
              <LeaveCommunityButton community={community} showIfJoined={community.variant === 'banner'} />
            )}
          </React.Fragment>
        ) : (
          <svg className="h-5 w-5 animate-spin text-blue-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
      </div>
    </div>
  )
}
