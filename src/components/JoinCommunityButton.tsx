import { User } from '../lib/model'
import { useAccount } from 'wagmi'
import { useJoinCommunity } from '../hooks/useJoinCommunity'

import React, { memo } from 'react'
import { TosConfirmationWrapper } from './TermsOfService/TosConfirmationWrapper'
import { useValidateUserBalance } from '../utils/useValidateUserBalance'
import { useTranslation } from 'next-i18next'
import { useUserIfJoined } from '../contexts/CommunityProvider'
import { toast } from 'react-toastify'
import { useLoaderContext } from '../contexts/LoaderContext'
import { Group } from '@/types/contract/ForumInterface'

interface JoinButtonProps {
  community: Group
}

export const JoinCommunityButton = memo(({ community }: JoinButtonProps) => {
  const { groupId, name: groupName } = community
  const { t } = useTranslation()
  const { address } = useAccount()
  const hasUserJoined: User | undefined | false = useUserIfJoined(groupId as string | number)

  const { setIsLoading, isLoading } = useLoaderContext()
  const { checkUserBalance } = useValidateUserBalance(community, address)

  const joinCommunity = useJoinCommunity()

  const validateBeforeOpen = async (): Promise<boolean> => {
    if (!address) {
      toast.error(t('alert.connectWallet'), { toastId: 'connectWallet' })

      return false
    }
    return await checkUserBalance()
  }
  const join = async () => {
    setIsLoading(true)
    const result = await validateBeforeOpen()
    if (!result) return
    if (!hasUserJoined) await joinCommunity(groupName, groupId)
  }
  const joinButton = (
    <button
      onClick={join}
      className={`flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 ${
        hasUserJoined ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
      } ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      disabled={isLoading}
    >
      {isLoading ? (
        <svg className="mr-2 h-5 w-5 animate-spin" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : hasUserJoined ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="h-5 w-5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : null}
      {t('button.join', { count: hasUserJoined ? 0 : 1 })}
    </button>
  )

  return (
    <>
      {hasUserJoined ? (
        joinButton
      ) : (
        <TosConfirmationWrapper
          buttonElement={joinButton}
          headerText={t('termsOfService.header')}
          descriptionText={t('termsOfService.description')}
          onAgree={join}
          validationBeforeOpen={validateBeforeOpen}
        />
      )}
    </>
  )
})

JoinCommunityButton.displayName = 'JoinCommunityButton'
