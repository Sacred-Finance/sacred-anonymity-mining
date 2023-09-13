import { User } from '../lib/model'
import { useAccount } from 'wagmi'

import React, { memo } from 'react'
import { TosConfirmationWrapper } from './TermsOfService/TosConfirmationWrapper'
import { useTranslation } from 'next-i18next'
import { useUserIfJoined } from '../contexts/CommunityProvider'
import { toast } from 'react-toastify'
import { Group } from '@/types/contract/ForumInterface'
import clsx from 'clsx'
import { PrimaryButton } from './buttons'
import { useLeaveCommunity } from '@/hooks/useLeaveCommunity'

interface JoinButtonProps {
  community: Group
}

export const LeaveCommunityButton = memo(({ community }: JoinButtonProps) => {
  const { groupId, name: groupName } = community

  const [isLoading, setIsLoading] = React.useState(false)
  const { t } = useTranslation()
  const { address } = useAccount()
  const hasUserJoined: User | undefined | false = useUserIfJoined(groupId as string | number)

  const { leaveCommunity } = useLeaveCommunity({id: groupId})

  const validateBeforeOpen = async (): Promise<boolean> => {
    if (!address) {
      toast.error(t('alert.connectWallet'), { toastId: 'connectWallet' })

      return false
    }
    return true
  }
  const leave = async () => {
    if (isLoading) return
    setIsLoading(true)
    const result = await validateBeforeOpen()
    if (!result) return
    if (hasUserJoined) {
      try {
        await leaveCommunity()
      } catch (error) {
        console.error(error)
        toast.error(error?.message ?? error)
      }
    }
    setIsLoading(false)
  }
  const leaveButton = (
    <PrimaryButton
      isLoading={isLoading}
      onClick={leave}
      className={clsx(
        `flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 `,
        'bg-red-500 hover:bg-red-600',
        'disabled:opacity-50'
      )}
    >
      {t('button.leave', { count: hasUserJoined ? 0 : 1 })}
    </PrimaryButton>
  )
  return (
    <>
      {leaveButton}
    </>
  )
})

LeaveCommunityButton.displayName = 'LeaveCommunityButton'
