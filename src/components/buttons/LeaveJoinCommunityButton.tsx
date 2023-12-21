import type { Group } from '@/types/contract/ForumInterface'
import type { User } from '@/lib/model'
import React from 'react'
import { LeaveCommunityButton } from '@components/buttons/LeaveCommunityButton'
import { JoinCommunityButton } from '@components/buttons/JoinCommunityButton'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { CircularLoader } from '@components/CircularLoader'

export function LeaveJoinCommunityButton({
  community,
  hasUserJoined,
}: {
  community: Group & {
    variant?: 'default' | 'banner'
    user: User | boolean | undefined
    setShowBackground: React.Dispatch<React.SetStateAction<boolean>>
    showBackground: boolean
    bannerSrc: string | undefined
  }
  hasUserJoined: User | boolean | null
}) {
  const { address } = useAccount()

  if (!address) {
    return <ConnectButton label="Connect" />
  }

  if (!community) {
    return <CircularLoader />
  }

  return (
    <>
      {hasUserJoined && <LeaveCommunityButton community={community} />}
      {!hasUserJoined && <JoinCommunityButton community={community} />}
    </>
  )
}
