import React from 'react'
import Image from 'next/image'
import { ethers } from 'ethers'

import { useLocalCommunity } from './CommunityCard'
import { chainLogos } from '../../constant/const'
import { getStringFromBytes32 } from '@/lib/utils'
import { CommunityLogo } from '@components/CommunityCard/CommunityCardHeader'

export const CommunityCardBody = () => {
  const community = useLocalCommunity()

  const isBanner = community?.variant === 'banner'
  const tags = community?.groupDetails?.tags || []

  const chainId = community?.chainId
  const requirements = community?.requirements || []

  return (
    <>
      <CommunityLogo logoClasses="w-24 h-24 mb-4 mx-auto" />
      {tags.length > 0 && (
        <div className="mx-auto mb-4 ">
          <p className="mb-2 text-lg font-semibold">Tags</p>
          <div className="grid grid-cols-1 gap-2">
            {tags
              .filter(tag => tag !== ethers.constants.HashZero)
              .map(tag => {
                const tagString = getStringFromBytes32(tag)
                return (
                  <div
                    className="flex items-center justify-center truncate rounded-lg bg-primary-500 p-1 text-center text-sm text-white"
                    style={{ maxWidth: '100%' }}
                    title={tagString}
                    key={tag}
                  >
                    {tagString}
                  </div>
                )
              })}
          </div>
        </div>
      )}

      <div className="flex flex-col space-y-2">
        <p className="text-lg font-semibold">Block Chain</p>
        <Image src={chainLogos[chainId]} alt={chainLogos[137]} width={30} height={30} className="mx-auto" />
      </div>

      {requirements.length > 0 && (
        <div className="flex flex-col space-y-2 rounded-lg p-4 ">
          <p className="text-lg font-semibold">Requirements</p>
          {requirements.map(r => (
            <p className="text-sm" key={r?.tokenAddress}>
              {`${r?.symbol} - ${Number(r?.minAmount) / 10 ** (r?.decimals ?? 0)}`}
            </p>
          ))}
        </div>
      )}

      {isBanner && (
        <div className="mt-4">
          <p className="mb-2 text-lg font-semibold">Community Description</p>
          <p className="text-sm">{community?.groupDetails?.description}</p>
        </div>
      )}
    </>
  )
}
