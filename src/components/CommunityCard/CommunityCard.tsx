import React, { useState } from 'react'
import { CommunityCardFooter } from './CommunityCardFooter'
import { useCheckIsOwner } from '../EditGroupNavigationButton'
import Link from 'next/link'
import { Group } from '@/types/contract/ForumInterface'
import { useUserIfJoined } from '@/contexts/CommunityProvider'
import { User } from '@/lib/model'
import { useAccount } from 'wagmi'
import mobileLogo from '../../../public/logo.svg'
import { ActionItem, SpeedDial } from '@components/buttons/SpeedDial'
import { PencilIcon } from '@heroicons/react/20/solid'
import { useRouter } from 'next/router'
import { useValidatedImage } from '@components/CommunityCard/UseValidatedImage'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shad/ui/card'
import { ScrollArea } from '@/shad/ui/scroll-area'
import { Separator } from '@/shad/ui/separator'
import RemoveGroup from '@components/RemoveGroup'

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
  if (!community) throw new Error('CommunityContext not found')
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
  const router = useRouter()
  const { address } = useAccount()
  const user = useUserIfJoined(community.id)
  const { isOwner } = useCheckIsOwner(community, address)
  const [showBackground, setShowBackground] = useState(false)
  const bannerSrc = useValidatedImage(community?.groupDetails?.bannerCID)

  if (!community || !community?.id) return <></>

  return (
    <CommunityCardContext.Provider
      value={{ ...community, variant, user, setShowBackground, showBackground, bannerSrc }}
    >
      <Card
        onMouseLeave={() => setShowBackground(false)}
        onClick={() => setShowBackground(false)}
        className={'relative bg-gray-300/20 dark:bg-gray-800/50'}
      >
        <CardHeader className={'flex'}>
          <CardTitle>
            {' '}
            <div className="flex items-center justify-between">
              <Link
                onClick={e => {
                  // if the background is visible we dont want to navigate
                  if (showBackground) {
                    e.preventDefault()
                    e.stopPropagation()
                  }
                }}
                href={`/communities/${community?.groupId}`}
              >
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold tracking-tight">{community.name}</h2>
                </div>
              </Link>
              <SpeedDial
                actions={[
                  (isAdmin || isOwner)
                    ? {
                        label: 'Edit',
                        icon: <PencilIcon className={'h-full w-4'} />,
                        onClick: () => router.push(`/communities/${community?.groupId}/edit`),
                      }
                    : false,
                    (isAdmin || isOwner) && <RemoveGroup groupId={community.id} hidden={false} />,
                  ...actions,
                ]}
              />
            </div>
            <Separator className="my-4" />
          </CardTitle>
          <CardDescription className={'line-clamp-2 h-24'}>
            <ScrollArea>{community?.groupDetails?.description}</ScrollArea>
          </CardDescription>
        </CardHeader>

        <CardContent>
          {(bannerSrc ?? mobileLogo) && (
            <Image
              className=" -z-1 pointer-events-none h-full w-full rounded-lg object-cover opacity-5"
              src={bannerSrc ?? mobileLogo}
              alt={'community logo'}
              fill={true}
              unoptimized
            />
          )}
        </CardContent>

        <CommunityCardFooter />
        {/*<CardOverlay />*/}
      </Card>
    </CommunityCardContext.Provider>
  )
}
