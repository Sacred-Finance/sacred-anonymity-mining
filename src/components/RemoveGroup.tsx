import React, { use, useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import ToolTip from '@components/HOC/ToolTip'

import { TrashIcon } from '@heroicons/react/20/solid'
import { useRemoveGroup } from '@/hooks/useRemoveGroup'
import { useAccount } from 'wagmi'
import { useCheckIfUserIsAdminOrModerator } from '@/hooks/useCheckIfUserIsAdminOrModerator'
import { LoaderComponent } from './LoaderComponent'
import { CircularLoader } from './JoinCommunityButton'

interface RemoveGroupProps {
  groupId: number
  hidden: boolean
}

const RemoveGroup: React.FC<RemoveGroupProps> = ({ groupId, hidden }) => {
  const { t } = useTranslation()
  const { writeAsync } = useRemoveGroup(groupId)

  const { address } = useAccount()
  const { isAdmin, fetchIsAdmin } = useCheckIfUserIsAdminOrModerator(address)
  const [isLoading, setIsLoading] = React.useState(false)

  useEffect(() => {
    fetchIsAdmin()
  }, [address])

  const onClick = () => {
    setIsLoading(true)
    writeAsync?.({ recklesslySetUnpreparedArgs: [groupId] }).finally(() => {
      setIsLoading(false)
    })
  }

  if (hidden) return null

  if (isLoading) return <CircularLoader />

  return (
    <>
      {isAdmin && (
        <ToolTip toolTip={t('toolTip.removeCommunity.message') as string}>
          <button
            id="edit-community-button"
            className={`${
              hidden ? 'hidden' : 'flex'
            } items-center justify-center rounded-full bg-transparent p-2 text-gray-500 transition duration-300 hover:bg-purple-600 hover:text-white`}
            onClick={onClick}
            aria-label="edit community"
          >
            <TrashIcon className="h-6 w-6" />
          </button>
        </ToolTip>
      )}
    </>
  )
}

export default RemoveGroup
