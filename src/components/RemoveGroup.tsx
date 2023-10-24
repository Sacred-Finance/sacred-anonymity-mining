import React, { useEffect } from 'react'
import { useTranslation } from 'next-i18next'

import { TrashIcon } from '@heroicons/react/20/solid'
import { useRemoveGroup } from '@/hooks/useRemoveGroup'
import { useAccount } from 'wagmi'
import { useCheckIfUserIsAdminOrModerator } from '@/hooks/useCheckIfUserIsAdminOrModerator'
import { CircularLoader } from './buttons/JoinCommunityButton'
import { Button } from '@/shad/ui/button'

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
        <Button
          variant={'destructive'}
          id="edit-community-button"
          className={'w-full'}
          onClick={onClick}
          aria-label="edit community"
        >
          Delete Group <TrashIcon className="h-6 w-6" />
        </Button>
      )}
    </>
  )
}

export default RemoveGroup
