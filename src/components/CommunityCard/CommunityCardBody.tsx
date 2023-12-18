import React from 'react'
import { ethers } from 'ethers'

import { useLocalCommunity } from './CommunityCard'
import { getStringFromBytes32 } from '@/lib/utils'
import { Badge } from '@/shad/ui/badge'

export const CommunityCardBody: React.FC = () => {
  const community = useLocalCommunity()

  const tags = community?.groupDetails?.tags || []

  const requirements = community?.requirements || []

  return (
    <div className="flex  flex-col  gap-4 space-y-2 overflow-hidden">
      <h3 className="space-x-2 text-lg  font-semibold">Tags</h3>
      <ul className="grid list-inside list-disc grid-cols-3">
        {tags
          .filter(tag => tag !== ethers.constants.HashZero)
          .map(tag => {
            const tagString = getStringFromBytes32(tag)
            return (
              <li className="text-sm text-gray-400" key={tag}>
                <Badge title={tagString} key={tag}>
                  {tagString}
                </Badge>
              </li>
            )
          })}
      </ul>

      <h3 className="text-lg font-semibold">Requirements</h3>
      <ul className="list-inside list-disc">
        {requirements.map(r => (
          <li className="text-sm text-gray-400" key={r?.tokenAddress}>
            <Badge>
              {r.minAmount} {r.symbol}
            </Badge>
          </li>
        ))}
      </ul>
    </div>
  )
}
