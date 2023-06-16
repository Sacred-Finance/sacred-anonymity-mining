import React from 'react'
import { useLocalCommunity } from './CommunityCard'
import { supportedChains } from '../../constant/const'
import clsx from 'clsx'
import { classes } from '../../styles/classes'

export const CommunityCardBody = () => {
  const community = useLocalCommunity()

  return (
    <div className={clsx('community-card-body bg-white p-4 shadow-lg dark:bg-gray-900')}>
      {community.name && (
        <p className="mt-14 overflow-hidden overflow-ellipsis whitespace-nowrap text-lg font-bold">{community.name}</p>
      )}
      <p className="text-xs">{`${community.userCount ?? 0} Members`}</p>
      {community?.requirements?.map(r => (
        <div className="mt-0" key={r?.tokenAddress}>
          <p className="text-xs">
            {`${r?.symbol}`} {' - '} {`${r?.symbol}`} {' - '} {Number(r?.minAmount) / 10 ** (r?.decimals ?? 0)}
          </p>
        </div>
      ))}
      {community.chainId && <p className="text-xs">{supportedChains[community.chainId]?.name}</p>}
    </div>
  )
}
