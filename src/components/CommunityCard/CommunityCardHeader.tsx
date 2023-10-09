import React from 'react'
import { useLocalCommunity } from './CommunityCard'
import clsx from 'clsx'
import mobileLogo from '../../../public/logo.svg'
import { MobileLogo } from '@components/Logo'
import Image from 'next/image'
import { User } from '@/lib/model'
import { Group } from '@/types/contract/ForumInterface'
import { useValidatedImage } from '@components/CommunityCard/UseValidatedImage'


interface CommunityCardHeaderProps {
  isOwner?: boolean
}

export function CommunityLogo({ logoClasses }: { logoClasses?: string }) {
  const community = useLocalCommunity()
  const classes = clsx(logoClasses, 'relative !w-24 !h-24 rounded-full', community.showBackground ? 'opacity-0' : '')

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

  return (
    <div className={'h-10'}>
      <span className={'m-2 w-full text-center'}>{community.name}</span>
    </div>
  )
}
