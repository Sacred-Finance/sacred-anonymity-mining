import React from 'react'
import { useLocalCommunity } from './CommunityCard'
import { chainLogos, supportedChains } from '../../constant/const'
import clsx from 'clsx'
import { classes } from '../../styles/classes'
import { getStringFromBytes32 } from '@/lib/utils'
import { Group } from '@/types/contract/ForumInterface'
import { User } from '@/lib/model'
import { ethers } from 'ethers'
import Image from 'next/image'
import { CommunityLogo } from '@components/CommunityCard/CommunityCardHeader'
import { useValidatedImage } from '@components/CommunityCard/UseValidatedImage'
interface CommunityTagsProps {
  community: Group & {
    variant?: 'default' | 'banner'
    user: User | false | undefined
  }
}
function CommunityTags({ community }: CommunityTagsProps) {
  return community?.groupDetails?.tags?.length ? (
    <div className="grid flex-grow-0 grid-cols-2 grid-rows-3 gap-2 overflow-y-scroll">
      <div className="sticky top-0 z-10 col-span-1 row-span-1 bg-white font-semibold">Tags</div>
      <div className="col-span-1 row-span-1"></div>

      {/* Tags List */}
      {community?.groupDetails?.tags
        .filter(tag => tag !== ethers.constants.HashZero)
        ?.map((tag, index) => (
          <div className="col-span-1 row-span-1 w-min rounded bg-primary-500 p-0.5 text-xs text-white" key={tag}>
            {getStringFromBytes32(tag)} {/* Replace getStringFromBytes32 with your conversion function */}
          </div>
        ))}
    </div>
  ) : (
    <></>
  )
}

export const CommunityCardBody = () => {
  const community = useLocalCommunity()

  const isBanner = community?.variant === 'banner'

  const logoSrc = useValidatedImage(community?.groupDetails?.logoCID)

  return (
    <div
      className={clsx(
        ' flex flex-grow flex-wrap items-start justify-start gap-2 p-2',
        !community.user && 'rounded-b',
        isBanner ? 'relative w-fit' : ''
      )}
    >
      <CommunityLogo />
      <CommunityInfo community={community} />
      <CommunityTags community={community} />
      <CommunityChainId community={community} />
      <CommunityRequirements community={community} />
      {community?.variant === 'banner' && (
        <ItemContainer>
          <p className=" font-semibold">Community Description</p>
          <p className="col-span-auto text-sm">{community?.groupDetails?.description} </p>
        </ItemContainer>
      )}
    </div>
  )
}

const CommunityInfo = ({ community }: { community: Group }) => {
  return (
    <div className={'flex flex-col'}>
      <p className=" font-semibold">Community Info</p>
      <p className="text-xs">{`${community.userCount ?? 0} Members`}</p>
      <p className="text-xs">{community.posts?.length > 0 ? `${community.posts.length} Posts` : 'No posts yet'}</p>
    </div>
  )
}

const CommunityChainId = ({ community }: { community: Group }) => {
  return (
    <div className={'flex flex-col'}>
      <p className=" font-semibold">Block Chain</p>
      <Image src={chainLogos[community.chainId]} alt={chainLogos[137]} width={25} height={25} />
    </div>
  )
}

interface ItemContainerVariants {
  default: string
  singleItem: string
}

const itemContainerVariants: ItemContainerVariants = {
  default: 'rounded ring-1 ring-gray-900/30 h-full ',
  singleItem: 'grid grid-cols-2 gap-1 items-center rounded h-full ',
}

export const ItemContainer = ({
  children,
  variant = 'default',
}: {
  children: React.ReactNode
  variant?: keyof ItemContainerVariants
}) => <div className={clsx(itemContainerVariants[variant])}> {children} </div>

const CommunityRequirements = ({ community }: { community: Group }) => {
  const renderRequirements = () =>
    community?.requirements?.map(r => (
      <p className="text-xs" key={r?.tokenAddress}>
        {`${r?.symbol}`} {' - '} {`${r?.symbol}`} {' - '} {Number(r?.minAmount) / 10 ** (r?.decimals ?? 0)}
      </p>
    ))
  return community?.requirements?.length > 0 ? (
    <ItemContainer>
      <p className=" font-semibold">Requirements</p>
      {renderRequirements()}
    </ItemContainer>
  ) : (
    <></>
  )
}
