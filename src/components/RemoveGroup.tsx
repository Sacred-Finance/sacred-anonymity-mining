import React from 'react'

import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/20/solid'
import { useRemoveGroup } from '@/hooks/useRemoveGroup'
import { CircularLoader } from './buttons/JoinCommunityButton'
import { Button } from '@/shad/ui/button'
import { useCommunityContext } from '@/contexts/CommunityProvider'
import {BigNumberish} from "@semaphore-protocol/group";

interface RemoveGroupProps {
  groupId: BigNumberish
  hidden: boolean
}

const RemoveGroup: React.FC<RemoveGroupProps> = ({ groupId, hidden }) => {
  const { write } = useRemoveGroup(groupId)

  const {
    state: { isAdmin, isModerator },
  } = useCommunityContext()
  const [isLoading, setIsLoading] = React.useState(false)

  const onClick = () => {
    setIsLoading(true)
    if (write) {
      write()
    }
  }

  if (hidden) {
    return null
  }

  if (isLoading) {
    return <CircularLoader />
  }

  return (
    <>
      {(isAdmin || isModerator) && (
        <Button
          variant="destructive"
          id="edit-community-button"
          onClick={onClick}
          aria-label="edit community"
        >
          <TrashIcon className="h-6 w-6" /> <span> Delete Group</span>
        </Button>
      )}
    </>
  )
}

export default RemoveGroup
