import { Group } from '@/types/contract/ForumInterface'
import { User } from '@/lib/model'
import React from 'react'
import { LeaveCommunityButton } from '@components/buttons/LeaveCommunityButton'
import { CircularLoader, JoinCommunityButton } from '@components/buttons/JoinCommunityButton'

export function LeaveJoinCommunityButton(props: {
  community: Group & {
    variant?: 'default' | 'banner'
    user: User | boolean | undefined
    setShowBackground: React.Dispatch<React.SetStateAction<boolean>>
    showBackground: boolean
    bannerSrc: string | undefined
  }
  hasUserJoined: User | boolean
}) {
  return (
    <>
      {props.community ? (
        <React.Fragment>
          {props.hasUserJoined ? (
            <LeaveCommunityButton community={props.community} />
          ) : (
            <React.Fragment>
              {props.hasUserJoined == null ? (
                <CircularLoader />
              ) : (
                <JoinCommunityButton community={props.community} hideIfJoined={props.community.variant === 'banner'} />
              )}
            </React.Fragment>
          )}
        </React.Fragment>
      ) : (
        <svg className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
    </>
  )
}
