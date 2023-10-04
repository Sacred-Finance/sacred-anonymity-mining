import React, { useEffect, useRef } from 'react'
import { CommunityCardFooter } from './CommunityCardFooter'
import EditGroupNavigationButton, { useCheckIsOwner } from '../EditGroupNavigationButton'
import RemoveGroup from '../RemoveGroup'
import { useRemoveGroup } from '../../hooks/useRemoveGroup'
import { CommunityCardHeader } from './CommunityCardHeader'
import { CommunityCardBody } from './CommunityCardBody'
import Link from 'next/link'
import { Group } from '@/types/contract/ForumInterface'
import { CommunityId, useUserIfJoined } from '@/contexts/CommunityProvider'
import clsx from 'clsx'
import { User } from '@/lib/model'
import { motion } from 'framer-motion'
import { useValidatedImage } from '@components/CommunityCard/UseValidatedImage'
import { useAccount } from 'wagmi'
import { Card } from 'flowbite-react'

export const CommunityCardContext = React.createContext<
  (Group & { variant?: 'default' | 'banner'; user: User | false | undefined }) | null
>(null)

export const useLocalCommunity = () => {
  const community = React.useContext(CommunityCardContext)
  if (!community) throw new Error('CommunityContext not found')
  return community
}
export const CommunityCard = ({
  community,
  isAdmin = false,
  variant = 'default',
  ...props
}: {
  community: Group & { variant?: 'default' | 'banner' }
  isAdmin?: boolean
  variant?: 'default' | 'banner'
}) => {
  const user = useUserIfJoined(community.groupId as string)

  // new ref for modal
  const cardRef = useRef<HTMLDivElement | null>(null)

  if (!community || !community?.id) return <div></div>

  // return <NewCard />

  if (community)
    return (
      <CommunityCardContext.Provider value={{ ...community, variant, user }}>
        <Card className="flex min-w-fit flex-nowrap" href="#" renderImage={() => <CommunityCardHeader />}>
          {/*<EditGroupNavigationButton community={community} />*/}
          <Link
            href={`/communities/${community?.groupId}`}
            className={clsx(' flex flex-grow', variant !== 'banner' ? 'pointer-events-auto ' : 'pointer-events-none')}
          >
            <CommunityCardBody />
          </Link>

          <CommunityCardFooter />
        </Card>
      </CommunityCardContext.Provider>
    )

  return null
}
