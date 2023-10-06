import React, { useState } from 'react'
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
import mobileLogo from '../../../public/logo.svg'
import { ActionItem, SpeedDial } from '@components/buttons/SpeedDial'
import { PencilIcon } from '@heroicons/react/20/solid'
import { useRouter } from 'next/router'
import { useValidatedImage } from '@components/CommunityCard/UseValidatedImage'
import Image from 'next/image'

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
}: {
  community: Group & { variant?: 'default' | 'banner' }
  isAdmin?: boolean
  variant?: 'default' | 'banner' // banner variant is used for the community banner, it does not have a shadow or hover effect, nor does it have a join button
  actions?: (ActionItem | false)[]
}) => {
  const router = useRouter()
  const { address } = useAccount()
  const user = useUserIfJoined(community.groupId as string)
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
        theme={{
          img: {
            base: 'relative',
          },
          root: {
            base: 'aspect-4 min-w-[450px] flex-col flex justify-between cursor-default relative  text-gray-900 dark:text-gray-100  rounded-lg bg-white dark:bg-gray-950/20  transition-transform transform ',
            children: clsx(
              'group min-w-[450px]  min-h-[200px] flex flex-col justify-between rounded-lg  p-2 flex-grow',
              variant === 'banner'
                ? 'text-xl'
                : 'max-w-[450px] shadow-primary-900 dark:shadow-primary-900 shadow-md hover:bg-gray-100 dark:hover:bg-gray-800 ' // banner should not have shadow or hover effects
            ),
          },
        }}
      >
        <SpeedDial
          // @ts-ignore
          onHover={e => {
            if (e.type === 'mouseenter') setShowBackground(true)
          }}
          actions={[
            isOwner
              ? {
                  label: 'Edit',
                  icon: <PencilIcon className={'h-full w-4'} />,
                  onClick: () => router.push(`/communities/${community?.groupId}/edit`),
                }
              : false,
            ...actions,
          ]}
        />

        <Link
          onClick={e => {
            // if the background is visible we dont want to navigate
            if (showBackground) {
              e.preventDefault()
              e.stopPropagation()
            }
          }}
          href={`/communities/${community?.groupId}`}
          className={clsx(
            'group flex h-fit flex-wrap items-start justify-start align-bottom transition-colors',
            variant !== 'banner'
              ? 'pointer-events-auto hover:text-blue-500 dark:hover:text-blue-400'
              : 'pointer-events-none'
          )}
        >
          <CommunityCardHeader isOwner={isOwner} />
        </Link>

        <CommunityCardBody />
        <div className="">
          <p
            className="line-clamp-4 overflow-hidden  whitespace-pre-wrap
             text-sm dark:text-gray-400"
          >
            {community?.groupDetails?.description}
          </p>
        </div>
        <CommunityCardFooter />
        <CardOverlay />
      </Card>
    </CommunityCardContext.Provider>
  )
}

const CardOverlay = () => {
  const community = useLocalCommunity()
  const { showBackground, bannerSrc } = community
  return (
    <div
      className={clsx(
        'absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-lg',
        showBackground ? 'bg-black' : 'hidden'
      )}
    >
      {/* Image Overlay */}
      {(bannerSrc ?? mobileLogo) && (
        <Image
          className="absolute inset-0 h-full w-full rounded-lg object-cover"
          src={bannerSrc ?? mobileLogo}
          alt={'community logo'}
          layout="fill"
          fill={true}
          unoptimized
        />
      )}
      {/* Name and Description Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/50"></div>
      <span className="z-10 font-bold text-white">{community?.name}</span>
      <div className="z-10 max-h-[150px] w-full overflow-y-scroll bg-gradient-to-t from-black/50 to-black/50 px-4 py-2 text-center text-white dark:bg-gray-400/20">
        {community?.groupDetails?.description}
      </div>
    </div>
  )
}
