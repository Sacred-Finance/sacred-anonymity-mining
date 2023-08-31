import React from 'react'
import { useLocalCommunity } from './CommunityCard'
import { supportedChains } from '../../constant/const'
import clsx from 'clsx'
import { classes } from '../../styles/classes'
import { getStringFromBytes32 } from '@/lib/utils'
import { Group } from '@/types/contract/ForumInterface'
import { User } from '@/lib/model'
import { ethers } from 'ethers'

function CommunityTags({
  community,
}: {
  community: Group & { variant?: 'default' | 'banner'; user: User | false | undefined }
}) {
  return community?.groupDetails?.tags?.length ? (
    <ItemContainer>
      <p className="mb-1 font-semibold">Tags</p>
      {community?.groupDetails?.tags
        .filter(tag => tag !== ethers.constants.HashZero)
        ?.map(tag => (
          <p className="w-fit flex-wrap rounded bg-blue-500 px-2 py-1 text-xs text-white" key={tag}>
            {getStringFromBytes32(tag)}
          </p>
        ))}
    </ItemContainer>
  ) : (
    <></>
  )
}

export const CommunityCardBody = () => {
  const community = useLocalCommunity()

  const isBanner = community?.variant === 'banner'
  return (
    <div
      className={clsx(
        ' grid grid-cols-2  gap-4  p-4 ',
        !community.user && ' rounded-b-lg',
        isBanner ? 'relative mx-2 w-fit ' : ''
      )}
    >
      <CommunityInfo community={community} />
      <CommunityTags community={community} />
      <CommunityChainId community={community} />
      <CommunityRequirements community={community} />

      {community?.variant === 'banner' && (
        <ItemContainer>
          <p className="mb-1 font-semibold">Community Description</p>
          <p className="col-span-auto text-sm">{community?.groupDetails?.description} </p>
        </ItemContainer>
      )}
    </div>
  )
}

const CommunityInfo = ({ community }: { community: Group }) => {
  return (
    <ItemContainer>
      <p className="mb-1 font-semibold">Community Info</p>
      <p className="text-xs">{`${community.userCount ?? 0} Members`}</p>
      <p className="text-xs">{community.posts?.length > 0 ? `${community.posts.length} Posts` : 'No posts yet'}</p>
    </ItemContainer>
  )
}

const CommunityChainId = ({ community }: { community: Group }) => {
  return (
    <ItemContainer>
      <p className="mb-1 font-semibold">Blockchain</p>
      <p className="text-xs">{supportedChains[community.chainId]?.name}</p>
    </ItemContainer>
  )
}

export const ItemContainer = ({ children }: { children: React.ReactNode }) => (
  <div className=" rounded-md p-1 ring-1 ring-gray-900/30"> {children} </div>
)

const CommunityRequirements = ({ community }: { community: Group }) => {
  const renderRequirements = () =>
    community?.requirements?.map(r => (
      <p className="text-xs" key={r?.tokenAddress}>
        {`${r?.symbol}`} {' - '} {`${r?.symbol}`} {' - '} {Number(r?.minAmount) / 10 ** (r?.decimals ?? 0)}
      </p>
    ))
  return community?.requirements?.length > 0 ? (
    <ItemContainer>
      <p className="mb-1 font-semibold">Requirements</p>
      {renderRequirements()}
    </ItemContainer>
  ) : (
    <></>
  )
}
