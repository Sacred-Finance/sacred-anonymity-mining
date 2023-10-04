import React from 'react'
import { useLocalCommunity } from './CommunityCard'
import clsx from 'clsx'
import mobileLogo from '../../../public/logo.svg'
import { MobileLogo } from '@components/Logo'
import Image from 'next/image'
import { User } from '@/lib/model'
import { Group } from '@/types/contract/ForumInterface'
import { useValidatedImage } from '@components/CommunityCard/UseValidatedImage'
import { PencilIcon, UserIcon } from '@heroicons/react/20/solid'
import { SpeedDial } from '@components/buttons/SpeedDial'
import { useRouter } from 'next/router'

interface CommunityCardHeaderProps {
  isOwner?: boolean
}

export function CommunityLogo({ logoClasses }: { logoClasses?: string }) {
  const community = useLocalCommunity()
  const classes = clsx(logoClasses, 'relative !w-24 !h-24 rounded-full ')

  const logoSrc = useValidatedImage(community?.groupDetails?.logoCID)
  return (
    <div className={'rounded '}>
      {logoSrc ? (
        <Image
          className={classes}
          src={logoSrc ?? mobileLogo}
          alt={'community logo'}
          width={100}
          height={100}
          unoptimized
        />
      ) : (
        <MobileLogo className={classes} />
      )}
    </div>
  )
}

interface CommunityBannerClasses {
  banner: string
  name: string
}

interface CommunityBannerParams {
  srcBannerOverride: string | undefined
  bannerSrc: string | undefined
  inputs: string
  banner: boolean
  community: Group & { variant?: 'default' | 'banner'; user: User | false | undefined }
  c?: CommunityBannerClasses
}

export function CommunityBanner(props: CommunityBannerParams) {
  return (
    <>
      {props.srcBannerOverride || props.bannerSrc ? (
        <Image
          className={clsx(
            props.inputs,
            props.banner && 'max-full bottom-0 left-0 top-0 z-0 h-max rounded-b object-cover opacity-90',
            props?.c?.banner
          )}
          src={props.srcBannerOverride ?? props.bannerSrc}
          alt={'community Banner Image'}
          sizes="100vw"
          style={{
            width: '100%',
          }}
          width={500}
          height={500}
          unoptimized
          priority
        />
      ) : (
        <div
          className={clsx(
            'col-span-full flex h-36 w-full items-center justify-center rounded-t bg-primary-500 text-xl font-semibold text-white',
            props?.c?.banner
          )}
        >
          {props.community?.name}
        </div>
      )}
    </>
  )
}
export const CommunityCardHeader: React.FC<CommunityCardHeaderProps> = ({ isOwner }) => {
  const community = useLocalCommunity()
  const bannerSrc = useValidatedImage(community?.groupDetails?.bannerCID)
  const router = useRouter()

  const [showBackground, setShowBackground] = React.useState(false)

  return (
    <div className={'h-10'}>
      <span className={'m-2 w-full text-center'}>{community.name}</span>
      {
        <div
          className={clsx(
            'absolute inset-0 z-0 h-full w-full overflow-hidden rounded-lg bg-black opacity-0 transition-opacity duration-300',
            showBackground && (bannerSrc ?? mobileLogo) ? 'opacity-100' : 'pointer-events-none opacity-10'
          )}
        >
          {(bannerSrc ?? mobileLogo) && (
            <Image
              className={clsx('absolute inset-0 flex h-full w-full justify-center rounded-lg')}
              src={bannerSrc ?? mobileLogo}
              alt={'community logo'}
              width={100}
              height={200}
              unoptimized
            />
          )}
          <p
            className={clsx(
              'absolute inset-0 left-0 flex h-full flex-col items-center justify-center bg-black/25  p-2 text-sm font-semibold text-white',
              showBackground && (bannerSrc ?? mobileLogo) ? 'opacity-100' : 'pointer-events-none opacity-0'
            )}
          >
            <div className={'flex flex-col rounded bg-black/70 p-1'}>
              <span>{community?.name}</span>
              {community?.groupDetails?.description}
            </div>
          </p>
        </div>
      }

      {(bannerSrc ?? mobileLogo) && (
        <SpeedDial
          // @ts-ignore
          onHover={e => {
            e.preventDefault()
            const isMouseOver = e.type === 'mouseenter'
            setShowBackground(isMouseOver)
          }}
          onOpen={() => setShowBackground(true)}
          actions={[
            isOwner
              ? {
                  label: 'Edit',
                  icon: <PencilIcon className={'h-full w-4'} />,
                  onClick: () => router.push(`/communities/${community?.groupId}/edit`),
                }
              : false,
            {
              label: 'Join',
              icon: <UserIcon className={'h-full w-4'} />,
              onClick: () => console.log('Join'),
            },
            {
              label: 'Leave',
              icon: <UserIcon className={'h-full w-4'} />,
              onClick: () => console.log('Leave'),
            },
          ]}
        />
      )}
    </div>
  )
}
