import { Dispatch, SetStateAction, useState } from 'react'
import { OutputData } from '@editorjs/editorjs'

type ContentManagementConfig = {
  isPostOrPoll: boolean
  defaultContentTitle?: string | null
  defaultContentDescription?: OutputData | null
}

type ContentManagementResult = {
  contentTitle?: string | null
  setContentTitle?: Dispatch<SetStateAction<string | null>>
  contentDescription: OutputData | null
  setContentDescription: Dispatch<SetStateAction<OutputData | null>>
  tempContents: any[]
  setTempContents: Dispatch<SetStateAction<any[]>>
  isContentEditable: boolean
  setIsContentEditable: Dispatch<SetStateAction<boolean>>
  isContentEditing: boolean
  setIsContentEditing: Dispatch<SetStateAction<boolean>>
  clearContent: () => void
}
export function useContentManagement(config: ContentManagementConfig): ContentManagementResult {
  const [contentTitle, setContentTitle] = useState<string | null>(config.defaultContentTitle || null)
  const [contentDescription, setContentDescription] = useState<OutputData | null>(
    config.defaultContentDescription || null
  )
  const [tempContents, setTempContents] = useState([])
  const [isContentEditable, setIsContentEditable] = useState(false)
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
      tempContents,
      setTempContents,
      isContentEditable,
      setIsContentEditable,
      isContentEditing,
      setIsContentEditing,
      clearContent
    }
  } else {
    return {
      contentDescription,
      setContentDescription,
      tempContents,
      setTempContents,
      isContentEditable,
      setIsContentEditable,
      isContentEditing,
      setIsContentEditing,
      clearContent
    }
  }
}
