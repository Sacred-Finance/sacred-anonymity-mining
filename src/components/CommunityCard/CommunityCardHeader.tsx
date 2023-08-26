import React, { useEffect, useState } from 'react'
import { useLocalCommunity } from './CommunityCard'
import { ethers } from 'ethers'
import _ from 'lodash'
import clsx from 'clsx'
import mobileLogo from '../../../public/logo.svg'
import { MobileLogo } from '@components/Logo'
import { ItemContainer } from '@components/CommunityCard/CommunityCardBody'

export const CommunityCardHeader = ({
  srcBannerOverride = undefined,
  srcLogoOverride = undefined,
}: {
  srcBannerOverride?: string
  srcLogoOverride?: string
}) => {
  const community = useLocalCommunity()
  const [bannerSrc, setBannerSrc] = useState('')
  const [logoSrc, setLogoSrc] = useState('')

  // Validate banner
  useEffect(() => {
    if (!community?.groupDetails.bannerCID) return
    const image = new Image()
    image.src = community?.groupDetails.bannerCID
      ? `https://ipfs.io/ipfs/${community?.groupDetails.bannerCID.toString()}`
      : ''
    image.onerror = () => setBannerSrc('') // Fallback to empty string if image is invalid
    image.onload = () => setBannerSrc(image.src)
  }, [community?.groupDetails.bannerCID])

  // Validate logo
  useEffect(() => {
    const image = new Image()
    if (!community?.groupDetails.logoCID) return

    image.src = community?.groupDetails.logoCID ? `https://ipfs.io/ipfs/${community.groupDetails.logoCID}` : ''
    image.onerror = () => setLogoSrc('') // Fallback to empty string if image is invalid
    image.onload = () => setLogoSrc(image.src)
  }, [community?.groupDetails.logoCID])

  const isBanner = community?.variant === 'banner'
  return (
    <div className="relative grid grid-cols-8 items-center justify-items-center">
      {srcBannerOverride || bannerSrc ? (
        <>
          <img
            className={clsx(
              'col-span-full  h-36 w-full rounded-t-lg object-cover',
              isBanner ? 'max-full bottom-0 left-0 top-0 z-0 h-max opacity-90 rounded-b-lg' : ''
            )}
            src={srcBannerOverride ?? bannerSrc}
            alt={mobileLogo}
          />
        </>
      ) : (
        <div className="col-span-full flex h-36 w-full items-center justify-center rounded-t-lg bg-primary-500 text-xl font-semibold text-white">
          {community?.name}
        </div>
      )}

      {srcLogoOverride || logoSrc ? (
        <img
          className="relative col-span-2  -mt-10 h-24  w-24 rounded-full border-4 border-white shadow-lg"
          src={srcLogoOverride ?? logoSrc ?? mobileLogo}
          alt={mobileLogo}
        />
      ) : (
        <MobileLogo className="relative col-span-2 -mt-10 h-24 w-24 rounded-full  border-4 border-white bg-white/80 p-4 shadow-lg" />
      )}


      {community?.groupDetails?.description && community.groupDetails.description !== community.name && (
        <div className="col-span-6 w-full">
          <p className="text-sm">{community?.groupDetails?.description}</p>
        </div>
      )}
    </div>
  )
}
