import React from 'react'
import { useCommunityById } from '@/contexts/CommunityProvider'
import { useRouter } from 'next/router'
import { EditGroup } from '@components/EditGroup'

export interface HandleSetImage {
  file: File | undefined
  imageType: 'logo' | 'banner'
}

export const isImageFile = (file: File) => {
  return file && file.type.startsWith('image/')
}

function EditGroupForm() {
  const router = useRouter()
  const { groupId } = router.query
  const [isMounted, setIsMounted] = React.useState(false)
  React.useEffect(() => {
    setIsMounted(true)
  }, [])
  const community = useCommunityById(groupId as string)
  if (!isMounted) {
    return null
  }
  if (!community || isNaN(community?.groupId)) {
    router?.push('/')
    return null
  }
  return <EditGroup group={community} />
}

export default EditGroupForm
