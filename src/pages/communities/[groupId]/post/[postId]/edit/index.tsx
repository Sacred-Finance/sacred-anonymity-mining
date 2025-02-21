import React from 'react'
import { useCommunityById } from '@/contexts/CommunityProvider'
import { useRouter } from 'next/router'
import { EditGroup } from '@components/form/EditGroup'

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
  const { groupId, postId } = router.query
  const community = useCommunityById(groupId as string)

  if (isNaN(community?.groupId) || !router.isReady) {
    return
  }
  return <EditGroup group={community} />
}

export default CreateGroupForm
