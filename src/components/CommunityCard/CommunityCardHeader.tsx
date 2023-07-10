import React, { useEffect, useState } from 'react'
import { useLocalCommunity } from './CommunityCard'
import { ethers } from 'ethers'

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
    const image = new Image()
    image.src = community?.banner ? `https://ipfs.io/ipfs/${community.banner}` : ''
    image.onerror = () => setBannerSrc('') // Fallback to empty string if image is invalid
    image.onload = () => setBannerSrc(image.src)
  }, [community?.banner])

  // Validate logo
  useEffect(() => {
    const image = new Image()
    image.src = community?.logo ? `https://ipfs.io/ipfs/${community.logo}` : ''
    image.onerror = () => setLogoSrc('') // Fallback to empty string if image is invalid
    image.onload = () => setLogoSrc(image.src)
  }, [community?.logo])

  return (
    <div className="relative">
      {bannerSrc ? (
        <img className="h-32 w-full rounded-t-lg object-cover" src={srcBannerOverride ?? bannerSrc} alt={''} />
      ) : (
        <div className="flex h-32 w-full items-center justify-center rounded-t-lg bg-blue-600 text-xl font-semibold text-white">
          {community?.name}
        </div>
      )}

      {logoSrc && (
        <img
          className="absolute ml-4 mt-4 h-24 w-24 -translate-y-1/2 transform rounded-full border-4 border-white shadow-lg"
          src={srcLogoOverride ?? logoSrc}
          alt={''}
        />
      )}
    </div>
  )
}
