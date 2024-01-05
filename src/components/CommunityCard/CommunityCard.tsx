import React, { useState } from 'react'
import { CommunityCardFooter } from './CommunityCardFooter'
import { useCheckIsOwner } from '../EditGroupNavigationButton'
import Link from 'next/link'
import type { Group } from '@/types/contract/ForumInterface'
import type { User } from '@/lib/model'
import { useAccount } from 'wagmi'
import mobileLogo from '../../../public/logo.svg'
import type { ActionItem } from '@components/CommunityCard/DropdownCommunityCard'
import { DropdownCommunityCard } from '@components/CommunityCard/DropdownCommunityCard'
import { PencilIcon } from '@heroicons/react/20/solid'
import { useValidatedImage } from '@components/CommunityCard/UseValidatedImage'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shad/ui/card'
import { ScrollArea } from '@/shad/ui/scroll-area'
import { useUserIfJoined } from '@/contexts/UseUserIfJoined'
import _ from 'lodash'

export const CommunityCardContext = React.createContext<
  | (Group & {
      variant?: 'default' | 'banner'
      user: User | false | undefined
      setShowBackground: React.Dispatch<React.SetStateAction<boolean>>
      showBackground: boolean
      bannerSrc: string | undefined
    })
  | null
>(null)

export const useLocalCommunity = () => {
  const community = React.useContext(CommunityCardContext)
  if (!community) {
    throw new Error('CommunityContext not found')
  }
  return community
}

export const CommunityCard = ({
  community,
  variant = 'default',
  actions = [false],
  isAdmin = false,
}: {
  community: Group & { variant?: 'default' | 'banner' }
  isAdmin?: boolean
  variant?: 'default' | 'banner' // banner variant is used for the community banner, it does not have a shadow or hover effect, nor does it have a join button
  actions?: (ActionItem | false)[]
}) => {
  const { address } = useAccount()
  const user = useUserIfJoined(community.id)
  const { isOwner } = useCheckIsOwner(community, address)
  const [showBackground, setShowBackground] = useState(false)
  const bannerSrc = useValidatedImage(community?.groupDetails?.bannerCID)
  const logoSrc = useValidatedImage(community?.groupDetails?.logoCID)

  const finalActions = [
    ...(isAdmin || isOwner
      ? [
          {
            label: 'Edit',
            icon: <PencilIcon className="h-full w-4" />,
            href: `/communities/${community.groupId}/edit`,
          },
        ]
      : []),
    ...actions,
  ]

  if (!community) {
    return <></>
  }

  return (
    <CommunityCardContext.Provider
      value={{
        ...community,
        variant,
        user,
        setShowBackground,
        showBackground,
        bannerSrc,
      }}
    >
      <Card
        onMouseLeave={() => setShowBackground(false)}
        onClick={() => setShowBackground(false)}
        className="group relative flex flex-col justify-between divide-y divide-gray-300/20 overflow-hidden rounded-lg  bg-gray-300/20 dark:divide-gray-800/50 dark:bg-gray-800/50"
      >
        <CardHeader className="relative z-10  flex w-full flex-col py-1 pe-2  ps-1  ">
          <CardTitle className="flex w-full justify-between gap-4">
            <Image
              className="pointer-events-none  z-10 h-[50px]  w-[50px] shrink-0 rounded-full bg-black/10 p-1 opacity-75"
              src={logoSrc || mobileLogo}
              alt="community banner"
              width={50}
              height={50}
              unoptimized
            />
            <div className="flex w-full items-center justify-between rounded-md">
              <Link
                onClick={e => {
                  if (showBackground) {
                    e.preventDefault()
                    e.stopPropagation()
                  }
                }}
                href={`/communities/${community?.groupId}`}
              >
                <span className="text-pretty text-2xl font-semibold tracking-tight">{_.startCase(community.name)}</span>
              </Link>
              <DropdownCommunityCard actions={finalActions} />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-[120px] px-2 pb-0 pt-2">
          {bannerSrc && (
            <Image
              className="pointer-events-none h-full w-full rounded-lg object-cover opacity-40 transition-opacity duration-300 ease-in-out group-hover:opacity-80"
              src={bannerSrc}
              alt="community banner"
              fill={true}
              unoptimized
            />
          )}

          <ScrollArea className="h-full rounded p-1 transition-colors delay-300 duration-500 hover:bg-card">
            <CardDescription className="z-10  h-24  text-base leading-snug text-card-foreground">
              {community?.groupDetails?.description}
            </CardDescription>
          </ScrollArea>
        </CardContent>

        <CommunityCardFooter />
      </Card>
    </CommunityCardContext.Provider>
  )
}
