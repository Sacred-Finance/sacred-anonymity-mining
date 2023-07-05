import React, { useState } from 'react'
import { useLocalCommunity } from './CommunityCard'
import { ethers } from 'ethers'

export const CommunityCardHeader = () => {
  const community = useLocalCommunity()
  const [bannerLoaded, setBannerLoaded] = useState(false)
  const [bannerError, setBannerError] = useState(false)

  const handleBannerLoad = () => {
    setBannerLoaded(true)
  }

  const handleBannerError = () => {
    setBannerError(true)
  }

  let bannerSrc = ''
  let logoSrc = ''
  if (community.banner && !community.banner.toLowerCase().includes(ethers.constants.AddressZero.toLowerCase()))
    bannerSrc = community?.banner && !bannerError ? `https://ipfs.io/ipfs/${community.banner}` : undefined
  if (community.logo && !community.logo.toLowerCase().includes(ethers.constants.AddressZero.toLowerCase()))
    logoSrc = community?.logo && !bannerError ? `https://ipfs.io/ipfs/${community.logo}` : undefined

  return (
    <div className="relative">
      {bannerLoaded && bannerSrc ? (
        <img
          className="h-32 w-full rounded-t-lg object-cover"
          src={bannerSrc}
          alt={''}
          onLoad={handleBannerLoad}
          onError={handleBannerError}
        />
      ) : (
        <div className="flex h-32 w-full items-center justify-center rounded-t-lg bg-blue-600 text-xl font-semibold text-white">
          {community?.name}
        </div>
      )}

      {logoSrc && (
        <img
          className="absolute ml-4 mt-4 h-24 w-24 -translate-y-1/2 transform rounded-full border-4 border-white shadow-lg"
          src={logoSrc}
          alt={''}
        />
      )}
    </div>
  )
}
