import React from 'react'
import { useLocalCommunity } from './CommunityCard'
import { useUserIfJoined } from '@/contexts/CommunityProvider'
import Image from 'next/image'
import { chainLogos, supportedChains } from '@/constant/const'
import ToolTip from '@components/HOC/ToolTip'
import { CardFooter } from '@/shad/ui/card'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/shad/ui/hover-card'
import { Button } from '@/shad/ui/button'
import { CommunityCardBody } from '@components/CommunityCard/CommunityCardBody'
import { LeaveJoinCommunityButton } from '@components/buttons/LeaveJoinCommunityButton'
import { FaCircleInfo } from 'react-icons/fa6'

export const CommunityCardFooter = () => {
  const community = useLocalCommunity()
  const userCount = community?.userCount
  const posts = community?.posts || []
  const hasUserJoined = useUserIfJoined(community.id.toString())
  if (!community) {
    return null
  }

  return (
    <CardFooter
      className={'relative z-40 flex justify-between gap-1  bg-opacity-10 p-2'}
    >
      <div className="flex  shrink basis-[66%] flex-wrap   gap-1  rounded lg:basis-[75%]">
        <Button
          variant="outline"
          className={' flex min-w-[45px] max-w-[75px] grow gap-1 text-xs'}
        >
          {userCount ?? 0}
          <span> Users</span>
        </Button>
        <Button
          variant="outline"
          className={' flex min-w-[45px] max-w-[75px] grow gap-1 text-xs'}
        >
          {posts.length}
          <span> Posts</span>
        </Button>
        <HoverCard openDelay={500} closeDelay={250}>
          <HoverCardTrigger asChild>
            <Button
              variant="outline"
              className={' min-w-[45px] max-w-[75px] text-xs'}
            >
              <FaCircleInfo className={'h-4 w-4 shrink-0'} />
              Info
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="pointer-events-auto max-h-96 w-96 overflow-y-auto ">
            <div className="space-y-1">
              <CommunityCardBody />
              <span className="max-h-72 text-xs text-muted-foreground">
                {' '}
                {community?.groupDetails?.description}
              </span>
            </div>
          </HoverCardContent>
        </HoverCard>

        <ToolTip
          tooltip={`chain ${community.chainId} ${supportedChains?.[
            community?.chainId
          ]?.name}`}
          buttonProps={{
            variant: 'outline',
            className: 'flex text-[12px] gap-2 max-w-[160px] min-w-[45px]',
          }}
        >
          <span>{supportedChains?.[community?.chainId]?.name}</span>
          <Image
            src={chainLogos[community.chainId]}
            alt={'ChainLogo'}
            width={35}
            height={35}
            className="h-4 w-4  rounded "
          />
        </ToolTip>
      </div>
      <div
        className={
          'flex h-full shrink grow basis-1/4 items-end justify-end self-end justify-self-end'
        }
      >
        <LeaveJoinCommunityButton
          community={community}
          hasUserJoined={hasUserJoined}
        />
      </div>
    </CardFooter>
  )
}
