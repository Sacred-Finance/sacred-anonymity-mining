import { JoinCommunityButton } from '../JoinCommunityButton'
import React from 'react'
import { useLocalCommunity } from './CommunityCard'
import RemoveGroup from '../RemoveGroup'

export const CommunityCardFooter = () => {
  const community = useLocalCommunity()


  if (!community) return null

  return (
    <div className="flex items-center justify-end rounded-b-lg bg-white p-4 dark:bg-gray-900 ">
      <div className='mr-auto'>
        <RemoveGroup groupId={community.id}  hidden={false} />
      </div>
      <div>
      {community ? (
        <JoinCommunityButton community={community} hideIfJoined={community.variant === 'banner'}  />
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
