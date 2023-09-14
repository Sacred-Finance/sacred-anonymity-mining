import React, { useEffect, useRef } from 'react'
import { CommunityCardFooter } from './CommunityCardFooter'
import EditGroupModal from '../EditGroupModal'
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

export const CommunityContext = React.createContext<
  (Group & { variant?: 'default' | 'banner'; user: User | false | undefined }) | null
>(null)

export const useLocalCommunity = () => {
  const community = React.useContext(CommunityContext)
  if (!community) throw new Error('CommunityContext not found')
  return community
}
export const CommunityCard = ({
  community,
  index,
  isAdmin = false,
  variant = 'default',
  ...props
}: {
  community: Group & { variant?: 'default' | 'banner' }
  index: number
  isAdmin?: boolean
  variant?: 'default' | 'banner'
}) => {
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

  const bannerSrc = useValidatedImage(community?.groupDetails?.bannerCID)
  const logoSrc = useValidatedImage(community?.groupDetails?.logoCID)

  if (!community || !community?.id) return <div className={'community-card-container'}></div>

  if (community)
    return (
      <motion.div
        className={clsx(
          'hover:border-opacity-50 hover:shadow-lg hover:ring-2 hover:ring-primary-500 hover:ring-opacity-60 hover:ring-offset-2',
          variant === 'banner'
            ? 'pointer-events-auto'
            : 'hover-peer:-z-[1] peer h-fit max-w-xl flex-grow items-center overflow-hidden rounded border border-gray-900 bg-white transition-all duration-300 ease-in-out hover:z-[150] sm:w-full md:w-auto '
        )}
        ref={cardRef}
      >
        <CommunityContext.Provider value={{ ...community, variant, user }}>
          <EditGroupModal community={community} hidden={!isEditGroupVisible} />
          <Link
            href={`/communities/${community?.groupId}`}
            className={clsx(variant !== 'banner' ? 'pointer-events-auto ' : 'pointer-events-none')}
          >
            <CommunityCardHeader logoSrc={logoSrc} bannerSrc={bannerSrc} />
            <CommunityCardBody logoSrc={logoSrc} />
          </Link>

          <div className={'flex-grow'} />
          <CommunityCardFooter />
        </CommunityContext.Provider>
      </motion.div>
    )

  return null
}
