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
    <CardFooter className={'flex justify-between'}>
      <div className="flex items-center gap-4 space-x-2 rounded">
        <ToolTip tooltip={'# Users'} buttonProps={{ variant: 'outline', className: 'flex gap-2' }}>
          {userCount ?? 0} <UserIcon className="h-full w-4" />
        </ToolTip>
        <ToolTip tooltip={'posts'} buttonProps={{ variant: 'outline', className: 'flex gap-2' }}>
          {posts.length}
          <BookOpenIcon className="h-full w-4" />
        </ToolTip>
        <HoverCard openDelay={500} closeDelay={250}>
          <HoverCardTrigger asChild>
            <Button variant="outline">
              <InfoIcon />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="pointer-events-auto max-h-96 w-96 overflow-y-auto">
            <div className="space-y-1">
              <CommunityCardBody />
              <span className="max-h-72 text-xs text-muted-foreground"> {community?.groupDetails?.description}</span>
            </div>
          </HoverCardContent>
        </HoverCard>

        <ToolTip
          tooltip={`chain ${community.chainId} ${supportedChains?.[community?.chainId]?.name}`}
          buttonProps={{ variant: 'outline', className: 'flex gap-2' }}
        >
          <Image src={chainLogos[community.chainId]} alt={'ChainLogo'} width={35} height={35} className="rounded" />
        </ToolTip>
      </div>

      <LeaveJoinCommunityButton community={community} hasUserJoined={hasUserJoined} />
    </CardFooter>
  )
}
