import { JoinCommunityButton } from '../JoinCommunityButton'
import React from 'react'
import { useLocalCommunity } from './CommunityCard'
import RemoveGroup from '../RemoveGroup'
import { BookOpenIcon, UserIcon } from '@heroicons/react/20/solid'
import Image from 'next/image'
import { chainLogos, supportedChains } from '@/constant/const'

export const CommunityCardFooter = () => {
  const community = useLocalCommunity()
  const userCount = community?.userCount
  const posts = community?.posts || []
  if (!community) return null

  return (
    <div className="flex h-9 items-center justify-between space-x-2 rounded-b-lg p-2 group-hover:z-10">
      <RemoveGroup groupId={community.id} hidden={false} />

      <div className="flex items-center gap-4 space-x-2 rounded">
        <p
          className="flex items-center gap-1 rounded bg-gray-200 p-2 text-sm hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          title={'users'}
        >
          {userCount ?? 0} <UserIcon className="h-full w-4" />
        </p>
        <p
          className="flex items-center gap-1 rounded bg-gray-200 p-2 text-sm hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          title={'posts'}
        >
          {posts.length} <BookOpenIcon className="h-full w-4" />
        </p>

        <div className="flex items-center rounded p-2 hover:bg-gray-300 dark:hover:bg-gray-600">
          <Image
            title={`chain ${community.chainId} ${supportedChains[community.chainId].name}`}
            src={chainLogos[community.chainId]}
            alt={chainLogos[137]}
            width={35}
            height={35}
            className="rounded"
          />
        </div>
      </div>

      {community ? (
        <JoinCommunityButton community={community} hideIfJoined={community.variant === 'banner'} />
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
