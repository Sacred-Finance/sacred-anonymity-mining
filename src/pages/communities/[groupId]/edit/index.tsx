import React from 'react'
import { useCommunityById } from '@/contexts/CommunityProvider'
import { useRouter } from 'next/router'
import { EditGroup } from '@components/EditGroup'
// todo: figure out when/if it's beneficial to make calls to individual contract updates vs editing the entire group at once

export interface HandleSetImage {
  file: File | null
  imageType: 'logo' | 'banner'
}

export const isImageFile = (file: File) => {
  return file && file.type.startsWith('image/')
}

function CreateGroupForm() {
  const router = useRouter()
  const { groupId } = router.query
  const [isMounted, setIsMounted] = React.useState(false)
  React.useEffect(() => {
    setIsMounted(true)
  }, [])
  const community = useCommunityById(groupId as string)
  // todo: this is a hack for when we refresh on the edit page and don't have the community data.
  // todo: we should fetch it here if it doesn't exist
  if (!isMounted) {
    return null
  }
  if (!community || isNaN(community?.groupId)) {
    router?.push('/')
    return null
  }
  return <EditGroup group={community} />
}

export default CreateGroupForm
