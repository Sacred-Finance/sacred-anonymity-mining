import React, { useEffect, useRef } from 'react'
import { CommunityCardFooter } from './CommunityCardFooter'
import EditGroupModal from '../EditGroupModal'
import RemoveGroup from '../RemoveGroup'
import { useRemoveGroup } from '../../hooks/useRemoveGroup'
import { CommunityCardHeader } from './CommunityCardHeader'
import { CommunityCardBody } from './CommunityCardBody'
import Link from 'next/link'
import { Group } from '@/types/contract/ForumInterface'
import {CommunityId} from "@/contexts/CommunityProvider";

export const CommunityContext = React.createContext<Group | null>(null)

export const useLocalCommunity = () => {
  const community = React.useContext(CommunityContext)
  if (!community) throw new Error('CommunityContext not found')
  return community
}
export const CommunityCard = ({
  community,
  index,
  isAdmin = false,
  ...props
}: {
  community: Group
  index: number
  isAdmin?: boolean
}) => {
  const [isEditGroupVisible, setIsEditGroupVisible] = React.useState(false)
  const [isDeleteGroupVisible, setIsDeleteGroupVisible] = React.useState(false)

  const { write } = useRemoveGroup(community.groupId as CommunityId)

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

  if (!community || !community?.id)
    return (
      <div className={'community-card-container'}>
      </div>
    )

  if (community)
    return (
      <div className={'relative  w-full max-w-[450px]'} ref={cardRef}>
        <CommunityContext.Provider value={community}>
          <div className={'community-card-container'}>
            <div className=" rounded-lg shadow-lg">
              <EditGroupModal community={community} hidden={!isEditGroupVisible} />
              {isAdmin && (
                <RemoveGroup
                  onClick={() =>  write?.({ recklesslySetUnpreparedArgs: [community.id] })}
                  hidden={!isDeleteGroupVisible}
                />
              )}

              <Link href={`/communities/${community?.groupId}`} shallow={true}>
                <CommunityCardHeader />
                <CommunityCardBody />
              </Link>
              <CommunityCardFooter />
            </div>
          </div>
        </CommunityContext.Provider>
      </div>
    )

  return null
}
