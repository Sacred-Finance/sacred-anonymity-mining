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

  if (!community || !community?.id) return <div className={'community-card-container'}></div>

  if (community)
    return (
      <motion.div
        className={clsx(
          'hover:border-opacity-50  hover:ring-opacity-60 hover:ring-offset-2',
          variant === 'banner'
            ? 'pointer-events-auto'
            : 'h-fit max-w-xl flex-grow items-center  rounded border border-gray-900  transition-all duration-300 ease-in-out sm:w-full md:w-auto '
        )}
        ref={cardRef}
      >
        <CommunityCardContext.Provider value={{ ...community, variant, user }}>
          <EditGroupNavigationButton community={community} />
          <Link
            href={`/communities/${community?.groupId}`}
            className={clsx(variant !== 'banner' ? 'pointer-events-auto ' : 'pointer-events-none')}
          >
            <CommunityCardHeader />
            <CommunityCardBody />
          </Link>

          <div className={'flex-grow'} />
          <CommunityCardFooter />
        </CommunityCardContext.Provider>
      </motion.div>
    )

  return null
}

const useCommunityEdit = (community: Group) => {
  const [isEditGroupVisible, setIsEditGroupVisible] = React.useState(false)
  const [isDeleteGroupVisible, setIsDeleteGroupVisible] = React.useState(false)
  const user = useUserIfJoined(community.groupId as string)

  // new ref for modal
  const cardRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!cardRef?.current) return () => {}
    cardRef.current.addEventListener('mouseenter', () => {
      setIsEditGroupVisible(true)
      setIsDeleteGroupVisible(true)
    })
    cardRef.current.addEventListener('mouseleave', () => {
      setIsEditGroupVisible(false)
      setIsDeleteGroupVisible(false)
    })

    return () => {
      cardRef?.current?.removeEventListener?.('mouseenter', () => {})
      cardRef?.current?.removeEventListener?.('mouseleave', () => {})
    }
  }, [cardRef])

  return { isEditGroupVisible, isDeleteGroupVisible, user, cardRef }
}
