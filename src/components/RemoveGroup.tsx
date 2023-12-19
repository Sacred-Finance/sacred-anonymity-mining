import React from 'react'

import { TrashIcon } from '@heroicons/react/20/solid'
import { useRemoveGroup } from '@/hooks/useRemoveGroup'
import { CircularLoader } from './buttons/JoinCommunityButton'
import { Button } from '@/shad/ui/button'
import { useCommunityContext } from '@/contexts/CommunityProvider'

interface RemoveGroupProps {
  groupId: number
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
          className="w-full"
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
