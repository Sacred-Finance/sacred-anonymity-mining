import { User } from '../../lib/model'
import { useAccount } from 'wagmi'

import React, { memo } from 'react'
import { useTranslation } from 'next-i18next'
import { useUserIfJoined } from '../../contexts/CommunityProvider'
import { toast } from 'react-toastify'
import { Group } from '@/types/contract/ForumInterface'
import { PrimaryButton } from './index'
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

  const { leaveCommunity } = useLeaveCommunity({ id: groupId })

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

  return (
    <PrimaryButton isLoading={isLoading} onClick={leave} variant={'destructive'}>
      {t('button.leave', { count: hasUserJoined ? 0 : 1 })}
    </PrimaryButton>
  )
})

LeaveCommunityButton.displayName = 'LeaveCommunityButton'
