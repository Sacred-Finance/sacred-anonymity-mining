import React from 'react'
import { useLocalCommunity } from './CommunityCard'
import { useUserIfJoined } from '@/contexts/CommunityProvider'
import { BookOpenIcon, UserIcon } from '@heroicons/react/20/solid'
import Image from 'next/image'
import { chainLogos, supportedChains } from '@/constant/const'
import ToolTip from '@components/HOC/ToolTip'
import { CardFooter } from '@/shad/ui/card'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/shad/ui/hover-card'
import { Button } from '@/shad/ui/button'
import { InfoIcon } from '@components/CommunityActionTabs'
import { CommunityCardBody } from '@components/CommunityCard/CommunityCardBody'
import { LeaveJoinCommunityButton } from '@components/buttons/LeaveJoinCommunityButton'

export const CommunityCardFooter = () => {
  const community = useLocalCommunity()
  const userCount = community?.userCount
  const posts = community?.posts || []
  const hasUserJoined = useUserIfJoined(community.id.toString())

  if (!community) return null

  return (
    <CardFooter className={'flex justify-between gap-2 p-2 md:p-6 '}>
      <div className="flex  shrink basis-[66%]   flex-wrap  gap-2 rounded">
        <ToolTip tooltip={'# Users'} buttonProps={{ variant: 'outline', className: ' grow max-w-[75px] min-w-[45px]' }}>
          {userCount ?? 0} <UserIcon className="h-full w-4" />
        </ToolTip>
        <ToolTip tooltip={'posts'} buttonProps={{ variant: 'outline', className: ' grow max-w-[75px] min-w-[45px]' }}>
          {posts.length}
          <BookOpenIcon className="min-w-[20px]" />
        </ToolTip>
        <HoverCard openDelay={500} closeDelay={250}>
          <HoverCardTrigger asChild>
            <Button variant="outline" className={' min-w-[45px] max-w-[75px] grow'}>
              <InfoIcon className=" min-w-[20px]" />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="pointer-events-auto max-h-96 w-96 overflow-y-auto ">
            <div className="space-y-1">
              <CommunityCardBody />
              <span className="max-h-72 text-xs text-muted-foreground"> {community?.groupDetails?.description}</span>
            </div>
          </HoverCardContent>
        </HoverCard>

        <ToolTip
          tooltip={`chain ${community.chainId} ${supportedChains?.[community?.chainId]?.name}`}
          buttonProps={{ variant: 'outline', className: ' grow max-w-[75px] min-w-[45px]' }}
        >
          <Image
            src={chainLogos[community.chainId]}
            alt={'ChainLogo'}
            width={35}
            height={35}
            className="h-14 min-w-fit rounded p-4 "
          />
        </ToolTip>
      </div>
      <div className={'flex h-full shrink grow basis-1/4 items-end justify-end self-end justify-self-end'}>
        <LeaveJoinCommunityButton community={community} hasUserJoined={hasUserJoined} />
      </div>
    </CardFooter>
  )
}
