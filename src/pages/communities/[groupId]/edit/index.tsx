import React, { useEffect } from 'react'
import { useCommunityContext } from '@/contexts/CommunityProvider'
import { useRouter } from 'next/router'
import { EditGroup } from '@components/form/EditGroup'
import useSWR from 'swr'
import type { GroupWithPostDataResponse } from '@pages/api/groupWithPostData'
import fetcher, { GroupPostAPI } from '@/lib/fetcher'
import { useCheckIfUserIsAdminOrModerator } from '@/hooks/useCheckIfUserIsAdminOrModerator'
import { ActionType } from "@/contexts/CommunityTypes";

export interface HandleSetImage {
  file: File | undefined | null
  imageType: 'logo' | 'banner'
  isDefault?: boolean
}

export const isImageFile = (file: File) => {
  return file && file.type.startsWith('image/')
}

function EditGroupForm() {
  const router = useRouter()
  const { groupId } = router.query

  const { data } = useSWR<GroupWithPostDataResponse>(
    GroupPostAPI(groupId),
    fetcher
  )

  const { dispatch } = useCommunityContext()
  useCheckIfUserIsAdminOrModerator(true)

  useEffect(() => {
    if (data?.users) {
      dispatch({
        type: ActionType.SET_USERS,
        payload: data?.users,
      })
    }
  }, [data])

  useEffect(() => {
    if (data?.group) {
      dispatch({
        type: ActionType.SET_ACTIVE_COMMUNITY,
        payload: {
          community: data?.group,
          postList: data?.posts,
        },
      })
    }
    return () => {
      dispatch({
        type: ActionType.SET_ACTIVE_COMMUNITY,
        payload: undefined,
      })
    }
  }, [data?.group])
  if (!data?.group) {
    return null
  }
  return <EditGroup group={data?.group} />
}

export default EditGroupForm
