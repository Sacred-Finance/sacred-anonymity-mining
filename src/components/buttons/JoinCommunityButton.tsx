import type { User } from '@/lib/model'
import { useAccount } from 'wagmi'
import { useJoinCommunity } from '@/hooks/useJoinCommunity'

import React, { memo } from 'react'
import { TosConfirmationWrapper } from '../TermsOfService/TosConfirmationWrapper'
import { useValidateUserBalance } from '@/utils/useValidateUserBalance'
import { useTranslation } from 'next-i18next'
import { useUserIfJoined } from '@/contexts/CommunityProvider'
import { toast } from 'react-toastify'
import type { Group } from '@/types/contract/ForumInterface'
import clsx from 'clsx'
import { PrimaryButton } from './index'
import { useConnectModal } from '@rainbow-me/rainbowkit'

interface JoinButtonProps {
  community: Group
  hideIfJoined?: boolean
}

export function CircularLoader({ className }: { className?: string }) {
  return (
    <svg
      className={clsx('h-5 w-5 animate-spin', className)}
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

export const JoinCommunityButton = memo(
  ({ community, hideIfJoined }: JoinButtonProps) => {
    const { openConnectModal } = useConnectModal()

    const { groupId, name: groupName } = community

    const [isLoading, setIsLoading] = React.useState(false)
    const { t } = useTranslation()
    const { address } = useAccount()
    const hasUserJoined: User | undefined | false = useUserIfJoined(
      groupId as string | number
    )

    const { checkUserBalance } = useValidateUserBalance(community, address)

    const joinCommunity = useJoinCommunity()

    const validateBeforeOpen = async (): Promise<boolean | undefined> => {
      if (!address) {
        if (openConnectModal) {
          openConnectModal()
        }
        toast.error(t('alert.connectWallet'), { toastId: 'connectWallet' })

        return false
      }
      return checkUserBalance()
    }
    const join = async () => {
      if (isLoading) {
        return
      }
      setIsLoading(true)
      const result = await validateBeforeOpen()
      if (!result) {
        return
      }
      if (!hasUserJoined) {
        await joinCommunity(groupName, groupId)
      }
      setIsLoading(false)
    }
    const joinButton = (
      <PrimaryButton
        isLoading={isLoading}
        onClick={join}
        variant={hasUserJoined ? 'secondary' : 'default'}
      >
        {hasUserJoined ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : null}
        {t('button.join', { count: hasUserJoined ? 0 : 1 })}
      </PrimaryButton>
    )
    return (
      <>
        {hasUserJoined ? (
          hideIfJoined ? (
            ''
          ) : (
            joinButton
          )
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
  }
)

JoinCommunityButton.displayName = 'JoinCommunityButton'
