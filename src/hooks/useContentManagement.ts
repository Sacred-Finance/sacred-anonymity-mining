import { Dispatch, SetStateAction, useState } from 'react'
import { OutputData } from '@editorjs/editorjs'

type ContentManagementConfig = {
  isPost: boolean
  defaultContentTitle?: string | undefined
  defaultContentDescription?: OutputData | undefined
}

type ContentManagementResult = {
  contentTitle?: string | undefined
  setContentTitle?: Dispatch<SetStateAction<string | undefined>>
  contentDescription: OutputData | undefined
  setContentDescription: Dispatch<SetStateAction<OutputData | undefined>>
  tempContents: any[]
  setTempContents: Dispatch<SetStateAction<any[]>>
  isContentEditable: boolean
  setIsContentEditable: Dispatch<SetStateAction<boolean>>
  isContentEditing: boolean
  setIsContentEditing: Dispatch<SetStateAction<boolean>>
}
export function useContentManagement(config: ContentManagementConfig): ContentManagementResult {
  console.log(config)
  const [contentTitle, setContentTitle] = useState<string | undefined>(config.defaultContentTitle)
  const [contentDescription, setContentDescription] = useState<OutputData | undefined>(config.defaultContentDescription)
  const [tempContents, setTempContents] = useState([])
  const [isContentEditable, setIsContentEditable] = useState(false)
  const [isContentEditing, setIsContentEditing] = useState(false)

  if (config.isPost) {
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
    }
  }
}
