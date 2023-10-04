import React from 'react'
import { CommunityCardFooter } from './CommunityCardFooter'
import { useCheckIsOwner } from '../EditGroupNavigationButton'
import { CommunityCardHeader } from './CommunityCardHeader'
import { CommunityCardBody } from './CommunityCardBody'
import Link from 'next/link'
import { Group } from '@/types/contract/ForumInterface'
import { useUserIfJoined } from '@/contexts/CommunityProvider'
import clsx from 'clsx'
import { User } from '@/lib/model'
import { Card } from 'flowbite-react'
import { useAccount } from 'wagmi'

export const CommunityCardContext = React.createContext<
  | (Group & {
      variant?: 'default' | 'banner'
      user: User | false | undefined
    })
  | null
>(null)

export const useLocalCommunity = () => {
  const community = React.useContext(CommunityCardContext)
  if (!community) throw new Error('CommunityContext not found')
  return community
}
// ... (rest of the imports)

export const CommunityCard = ({
  community,
  variant = 'default',
}: {
  community: Group & { variant?: 'default' | 'banner' }
  isAdmin?: boolean
  variant?: 'default' | 'banner'
}) => {
  const { address } = useAccount()
  const user = useUserIfJoined(community.groupId as string)
  const { isOwner } = useCheckIsOwner(community, address)
  if (!community || !community?.id) return <></>

  return (
    <CommunityCardContext.Provider value={{ ...community, variant, user }}>
      <Card
        theme={{
          img: {
            base: 'relative',
          },
          root: {
            base: 'cursor-default relative shadow-md shadow-primary-300 dark:shadow-gray-500 rounded-lg bg-gray-50 dark:bg-gray-950/20  hover:bg-gray-100 dark:hover:bg-gray-800 p-2 transition-transform transform ',
            children: 'group min-w-[450px] min-h-[200px] flex flex-col justify-between rounded-lg  ',
          },
        }}
        renderImage={() => <CommunityCardHeader isOwner={isOwner} />}
      >
        <Link
          href={`/communities/${community?.groupId}`}
          className={clsx(
            'group flex h-fit flex-wrap items-start justify-start align-bottom transition-colors',
            variant !== 'banner'
              ? 'pointer-events-auto hover:text-blue-500 dark:hover:text-blue-400'
              : 'pointer-events-none'
          )}
        >
          <CommunityCardBody />
        </Link>

        <CommunityCardFooter />
      </Card>
    </CommunityCardContext.Provider>
  )
}
