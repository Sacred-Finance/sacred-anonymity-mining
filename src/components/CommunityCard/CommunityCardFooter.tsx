import { CircularLoader, JoinCommunityButton } from '../JoinCommunityButton'
import React, { useState } from 'react'
import { useLocalCommunity } from './CommunityCard'
import { LeaveCommunityButton } from '../LeaveCommunityButton'
import { useUserIfJoined } from '@/contexts/CommunityProvider'
import RemoveGroup from '../RemoveGroup'
import { BookOpenIcon, UserIcon } from '@heroicons/react/20/solid'
import Image from 'next/image'
import { chainLogos, supportedChains } from '@/constant/const'
import ToolTip from '@components/HOC/ToolTip'

export const CommunityCardFooter = () => {
  const community = useLocalCommunity()
  const userCount = community?.userCount
  const posts = community?.posts || []
  const hasUserJoined = useUserIfJoined(community.id.toString())

  if (!community) return null

  return (
    <div className="flex h-10 items-center justify-between space-x-2 rounded-b-lg py-2 group-hover:z-10">
      <RemoveGroup groupId={community.id} hidden={false} />

      <div className="flex items-center gap-4 space-x-2 rounded">
        <ToolTip tooltip={'# Users'}>
          <p
            className="flex items-center gap-1 rounded bg-gray-200 p-1 text-sm hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
            title={'users'}
          >
            {userCount ?? 0} <UserIcon className="h-full w-4" />
          </p>
        </ToolTip>
        <ToolTip tooltip={'posts'}>
          <p className=" flex items-center gap-1 rounded bg-gray-200 p-1 text-sm hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600">
            {posts.length}

            <BookOpenIcon className="h-full w-4" />
          </p>
        </ToolTip>

        <div className="flex items-center   rounded hover:bg-gray-300 dark:hover:bg-gray-600">
          <Image
            title={`chain ${community.chainId} ${supportedChains?.[community?.chainId]?.name}`}
            src={chainLogos[community.chainId]}
            alt={'ChainLogo'}
            width={35}
            height={35}
            className="rounded"
          />
        </div>
      </div>

      {community ? (
        <React.Fragment>
          {hasUserJoined ? (
            <LeaveCommunityButton community={community} />
          ) : (
            <React.Fragment>
              {hasUserJoined == null ? (
                <CircularLoader />
              ) : (
                <JoinCommunityButton community={community} hideIfJoined={community.variant === 'banner'} />
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
    </div>
  )
}
