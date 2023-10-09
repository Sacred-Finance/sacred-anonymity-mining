// Avatar.tsx

import { User } from '@/lib/model'
import { getAvatarUrl } from '@/contexts/CommunityProvider'
import clsx from 'clsx'
import { motion } from 'framer-motion'

export const Avatar = ({
  user,
  size = 'md',
  className = '',
  title = '',
  onClick,
  isOnline,
  isOwner,
  isModerator,
  isVerified,
  isCommunityAdmin,
}: {
  user: User | string | undefined
  size?: 'sm' | 'md' | 'lg'
  className?: string
  title?: string
  onClick?: () => void
  isOnline?: boolean
  isOwner?: boolean
  isModerator?: boolean
  isVerified?: boolean
  isCommunityAdmin?: boolean
}) => {
  let avatar = { name: '', url: '' }
  if (!user) return null
  if (typeof user === 'string') {
    avatar = { name: user, url: getAvatarUrl(user) }
  }
  if (typeof user === 'object') {
    avatar = { ...user, url: getAvatarUrl(user?.identityCommitment?.toString()) }
  }

  return (
    <div
      className={`relative grid-cols-4 rounded-full !p-0 outline-red-500 ${className} `}
      onClick={onClick}
      title={title}
    >
      <div className={'absolute  bottom-0  right-0 col-span-2 flex h-full flex-col justify-between py-1'}>
        {isOnline && (
          <div
            className={` h-2 w-2 rounded-full border-2 border-white bg-green-500 hover:scale-110`}
            title={'Is Online'}
          />
        )}

        {isOwner && (
          <div
            className={` h-2 w-2 rounded-full border-2 border-white bg-blue-500 hover:scale-110`}
            title={'Is Owner'}
          />
        )}

        {isModerator && (
          <div
            className={` h-2 w-2 rounded-full border-2 border-white bg-yellow-500 hover:scale-110`}
            title={'Is Moderator'}
          />
        )}

        {isVerified && (
          <div
            className={` h-2 w-2 rounded-full border-2 border-white bg-gray-500 hover:scale-110`}
            title={'Is Verified'}
          />
        )}

        {isCommunityAdmin && (
          <div className={` h-2 w-2 rounded-full border-2 border-white bg-red-500 hover:scale-110`} />
        )}
      </div>
      <img
        className={clsx(
          `col-span-2 cursor-pointer rounded-full border-2 border-white bg-red-400`,
          size === 'sm' ? 'h-8 w-8' : size === 'md' ? 'h-10 w-10' : 'h-12 w-12'
        )}
        src={avatar?.url}
        alt={avatar?.name}
      />
    </div>
  )
}
