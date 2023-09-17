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
  showDescription?: boolean
}

export function CommunityLogo() {
  const community = useLocalCommunity()
  const logoClasses = '-h-24 relative col-span-2 w-24 rounded-full border-4 border-white shadow-lg'

  const logoSrc = useValidatedImage(community?.groupDetails?.logoCID)
  return (
    <>
      {logoSrc ? (
        <Image
          className={logoClasses}
          src={logoSrc ?? mobileLogo}
          alt={'community logo'}
          width={100}
          height={100}
          unoptimized
        />
      ) : (
        <MobileLogo className={logoClasses} />
      )}
    </>
  )
}

function CommunityBanner(props: {
  srcBannerOverride: string | undefined
  bannerSrc: string | undefined
  inputs: string
  banner: boolean
  community: Group & { variant?: 'default' | 'banner'; user: User | false | undefined }
}) {
  return (
    <>
      {props.srcBannerOverride || props.bannerSrc ? (
        <Image
          className={clsx(
            props.inputs,
            props.banner && 'max-full bottom-0 left-0 top-0 z-0 h-max rounded-b object-cover opacity-90'
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
        <div className="col-span-full flex h-36 w-full items-center justify-center rounded-t bg-primary-500 text-xl font-semibold text-white">
          {props.community?.name}
        </div>
      )}
    </>
  )
}

export const CommunityCardHeader: React.FC<CommunityCardHeaderProps> = ({
  showDescription = true,
}: {
  showDescription: boolean
}) => {
  const community = useLocalCommunity()

  const bannerSrc = useValidatedImage(community?.groupDetails?.bannerCID)

  const isBanner = community?.variant === 'banner'

  const commonBannerClasses = 'col-span-full h-36 w-full object-cover'

  return (
    <div className="relative grid grid-cols-8 items-center justify-items-center ">
      <CommunityBanner
        srcBannerOverride={bannerSrc}
        bannerSrc={bannerSrc}
        inputs={commonBannerClasses}
        banner={isBanner}
        community={community}
      />

      {community?.groupDetails?.description && showDescription && community.groupDetails.description !== community.name && !isBanner && (
        <div
          className={clsx(
            'absolute bottom-0 left-[25%] col-span-6 me-2 max-h-[30px] w-fit overflow-y-hidden rounded border bg-gray-50 p-1 hover:z-50 hover:max-h-full hover:w-auto'
          )}
        >
          <p className="text-sm">{community?.groupDetails?.description}</p>
        </div>
      )}
    </div>
  )
}
