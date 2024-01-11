import React from 'react'

// Assuming '@heroicons/react/20/solid' is the correct path
import { TrashIcon } from '@heroicons/react/20/solid'

// Aliased imports
import { useRemoveGroup } from '@/hooks/useRemoveGroup'
import { useCommunityContext } from '@/contexts/CommunityProvider'

// Adjusted import path for CircularLoader based on your project structure
import { CircularLoader } from '@/components/buttons/JoinCommunityButton'

// Adjusted import path for Button component
import { Button } from '@/shad/ui/button'

import type { BigNumberish } from '@semaphore-protocol/group'

interface RemoveGroupProps {
  groupId: BigNumberish
  hidden: boolean
}

const RemoveGroup: React.FC<RemoveGroupProps> = ({ groupId, hidden }) => {
  const { write, isLoading } = useRemoveGroup(groupId)

  const {
    state: { isAdmin, isModerator },
  } = useCommunityContext()

  const onClick = async () => {
    console.log('write', write)
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
          type="button"
          variant="destructive"
          id="remove-group-button"
          onClick={onClick}
          aria-label="delete group"
        >
          <TrashIcon className="h-6 w-6" /> <span> Delete Group</span>
        </Button>
      )}
    </>
  )
}

export default RemoveGroup
