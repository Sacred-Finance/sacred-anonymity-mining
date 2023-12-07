import React, { useEffect } from 'react'
import { useTranslation } from 'next-i18next'

import { TrashIcon } from '@heroicons/react/20/solid'
import { useRemoveGroup } from '@/hooks/useRemoveGroup'
import { useAccount } from 'wagmi'
import { CircularLoader } from './buttons/JoinCommunityButton'
import { Button } from '@/shad/ui/button'
import { useCommunityContext } from '@/contexts/CommunityProvider'

interface RemoveGroupProps {
  groupId: number
  hidden: boolean
}

const RemoveGroup: React.FC<RemoveGroupProps> = ({ groupId, hidden }) => {
  const { t } = useTranslation()
  const { writeAsync } = useRemoveGroup(groupId)

  const { address } = useAccount()
  const {
    state: { isAdmin, isModerator },
  } = useCommunityContext()
  const [isLoading, setIsLoading] = React.useState(false)

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
      {(isAdmin || isModerator) && (
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
