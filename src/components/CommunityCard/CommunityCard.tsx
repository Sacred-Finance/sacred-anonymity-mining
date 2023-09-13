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
import { useFetchUsers } from '@/hooks/useFetchUsers'

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
  const user = useUserIfJoined(community.groupId as string);
  useFetchUsers(community.groupId as string);

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

  if (!community || !community?.id) return <div className={'community-card-container'}></div>

  if (community)
    return (
      <div
        className={clsx(
          'relative w-full',
          variant === 'banner' ? 'pointer-events-auto ' : 'max-w-[450px] rounded-lg ring-1 ring-gray-900'
        )}
        ref={cardRef}
      >
        <CommunityContext.Provider value={{ ...community, variant, user }}>
          <div className={'relative flex h-full flex-col rounded-lg'}>
            <EditGroupModal community={community} hidden={!isEditGroupVisible} />
            <Link
              href={`/communities/${community?.groupId}`}
              className={clsx(variant !== 'banner' ? 'pointer-events-auto' : 'pointer-events-none')}
            >
              <CommunityCardHeader />
              <CommunityCardBody />
            </Link>
            <div className={'flex-1'} />
            {<CommunityCardFooter />}
          </div>
        </CommunityContext.Provider>
      </div>
    )

  return null
}
