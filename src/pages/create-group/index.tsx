import React from 'react'
import { CreateGroup } from '@components/form/CreateGroup'
import { useCommunityContext } from '@/contexts/CommunityProvider'
import { ActionType } from '@/contexts/CommunityTypes'
import EnforceConnectionOverlay from '@components/HOC/EnforceConnectionOverlay'

function CreateGroupForm() {
  const { dispatch } = useCommunityContext()

  // Cleanup function to reset community context when leaving this page
  React.useEffect(() => {
    return () => {
      dispatch({
        type: ActionType.SET_ACTIVE_COMMUNITY,
        payload: undefined,
      })
    }
  }, [])

  return (
    <EnforceConnectionOverlay>
      <CreateGroup />
    </EnforceConnectionOverlay>
  )
}

export default CreateGroupForm
