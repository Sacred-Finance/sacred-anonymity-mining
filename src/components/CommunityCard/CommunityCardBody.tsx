import React from 'react'
import { ethers } from 'ethers'

import { useLocalCommunity } from './CommunityCard'
import { getStringFromBytes32 } from '@/lib/utils'
import { CommunityLogo } from '@components/CommunityCard/CommunityCardHeader'

export const CommunityCardBody: React.FC = () => {
  const community = useLocalCommunity()

  const tags = community?.groupDetails?.tags || []

  const requirements = community?.requirements || []

  return (
    <div className="flex min-h-fit w-full items-start space-x-4 dark:text-white">
      <CommunityLogo />
      {tags.length > 0 && (
        <div className="flex h-fit flex-col space-y-2 border-gray-200 px-2 dark:border-gray-700">
          <p className="text-base font-light dark:text-gray-300">Tags</p>
          <div className="flex flex-wrap space-x-2">
            {tags
              .filter(tag => tag !== ethers.constants.HashZero)
              .map(tag => {
                const tagString = getStringFromBytes32(tag)
                return (
                  <span
                    className="flex w-fit items-center truncate rounded-md bg-gray-200 px-2 py-0.5 text-xs dark:bg-gray-700 dark:text-gray-300"
                    style={{ maxWidth: '100%' }}
                    title={tagString}
                    key={tag}
                  >
                    {tagString}
                  </span>
                )
              })}
          </div>
        </div>
      )}

      <div className="flex h-fit flex-col space-y-2 px-2">
        <p className="text-base font-light dark:text-gray-300">
          {requirements.length > 0 ? 'Requirements' : 'No Requirements'}
        </p>
        {requirements.map(r => (
          <span
            className="flex w-fit items-center truncate rounded-md bg-gray-200 px-2 py-0.5 text-xs dark:bg-gray-700 dark:text-gray-300"
            key={r?.tokenAddress}
          >
            {/*{`${r?.symbol} - ${Number(r?.minAmount) / 10 ** (r?.decimals || 0)}`}*/}
              {/* ETHERS FORMAT NUMBER */}
              {ethers.BigNumber.from(r?.minAmount).div(ethers.BigNumber.from(10).pow(r?.decimals || 0)).toString()}
              {ethers.constants.AddressZero !== r?.tokenAddress && ` ${r?.tokenAddress.slice(0, 6)}...${r?.tokenAddress.slice(-4)}`}
          </span>
        ))}
      </div>
    </div>
  )
}
