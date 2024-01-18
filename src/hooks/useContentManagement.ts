import type { Dispatch, SetStateAction } from 'react'
import { useState } from 'react'
import type { OutputData } from '@editorjs/editorjs'
import { useCommunityContext } from '@/contexts/CommunityProvider'

type ContentManagementConfig = {
  isPostOrPoll: boolean
  defaultContentTitle?: string | null
  defaultContentDescription?: typeof OutputData | null
}

type ContentManagementResult = {
  contentTitle?: string | null
  setContentTitle?: Dispatch<SetStateAction<string | null>>
  contentDescription: typeof OutputData | null
  setContentDescription: Dispatch<SetStateAction<typeof OutputData | null>>
  isContentEditable: boolean
  setIsContentEditable: Dispatch<SetStateAction<boolean>>
  isContentEditing: boolean
  setIsContentEditing: Dispatch<SetStateAction<boolean>>
  clearContent: () => void
}
export function useContentManagement(config: ContentManagementConfig): ContentManagementResult {
  const [contentTitle, setContentTitle] = useState<string | null>(config.defaultContentTitle || null)
  const [contentDescription, setContentDescription] = useState<typeof OutputData | null>(
    config.defaultContentDescription || null
  )

  const {
    state: { isAdmin, isModerator },
  } = useCommunityContext()

  const [isContentEditable, setIsContentEditable] = useState(isAdmin || isModerator || false)
  const [isContentEditing, setIsContentEditing] = useState(false)

  const clearContent = () => {
    setContentTitle(null)
    setContentDescription(null)
    console.log('Data Cleared')
  }

  if (config.isPostOrPoll) {
    return {
      contentTitle,
      setContentTitle,
      contentDescription,
      setContentDescription,
      isContentEditable,
      setIsContentEditable,
      isContentEditing,
      setIsContentEditing,
      clearContent,
    }
  } else {
    return {
      contentDescription,
      setContentDescription,
      isContentEditable,
      setIsContentEditable,
      isContentEditing,
      setIsContentEditing,
      clearContent,
    }
  }
}
