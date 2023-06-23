import { Community, User } from '../lib/model'
import { useAccount, useProvider } from 'wagmi'
import { useJoinCommunity } from '../hooks/useJoinCommunity'

import React, { memo } from 'react'
import { TosConfirmationWrapper } from './TermsOfService/TosConfirmationWrapper'
import { useValidateUserBalance } from '../utils/useValidateUserBalance'
import { useTranslation } from 'next-i18next'
import { useUserIfJoined } from '../contexts/CommunityProvider'
import { polygonMumbai } from 'wagmi/chains'
import { toast } from 'react-toastify'

interface JoinButtonProps {
  community: Community
}

export const JoinCommunityButton = memo(({ community }: JoinButtonProps) => {
  const { groupId, name: groupName } = community
  const { t } = useTranslation()
  const { address } = useAccount()
  const hasUserJoined: User | undefined | false = useUserIfJoined(groupId as string | number)

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
    const result = await validateBeforeOpen()
    if (!result) return
    if (!hasUserJoined) await joinCommunity(groupName, groupId)
  }

  const joinButton = (
    <button
      onClick={join}
      className={`join-community-button rounded-md px-6 py-2 font-semibold  transition-colors duration-200 hover:bg-blue-700 dark:text-white ${
        hasUserJoined ? 'joined' : ''
      }`}
    >
      {t('button.join', { count: hasUserJoined ? 0 : 1 })}
      {hasUserJoined && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="ml-2 inline-block h-5 w-5 align-middle"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
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
