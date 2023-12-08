import React from 'react'
import { useGPTServerAnalysis } from '@/hooks/useGPTServerAnalysis' // Import the custom hook
import { PrimaryButton } from '@components/buttons/PrimaryButton'
import { SparklesIcon } from '@heroicons/react/20/solid'
import EditorJsRenderer from '@components/editor-js/EditorJSRenderer'
import clsx from 'clsx'
import { Template } from '@pages/api/gpt-server/logos-ai'
import type { EditorJsType } from '@components/NewPostForm'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shad/ui/dialog'

interface AnonymizeButtonProps {
  postData: EditorJsType
  postTitle?: string
  setDescription: (value: EditorJsType) => void
  handleUpdate: (arg) => void
  refToUpdateOnChange?: React.MutableRefObject<EditorJsType>
}

function convertEditorJsTypeToString(postData: EditorJsType) {
  let result = ''
  for (let i = 0; i < postData?.blocks?.length; i++) {
    result += postData.blocks[i].data.text
  }
  return result
}

const AnonymizeButton: React.FC<AnonymizeButtonProps> = ({
  postData,
  postTitle,
  setDescription,
  refToUpdateOnChange,
}) => {
  const [analysis] = useGPTServerAnalysis([
    {
      postData: convertEditorJsTypeToString(postData),
      template: Template.Anonymize,
    },
  ])
  const { isLoading, data, error, fetchData } = analysis
  const [showModal, setShowModal] = React.useState(!isLoading && data)

  const toggleModal = () => {
    setShowModal(!showModal)
  }

  React.useEffect(() => {
    if (data) {
      console.log(data)
      setShowModal(true)
    }
  }, [data])

  const useThis = React.useCallback(() => {
    setDescription({
      time: new Date().getTime(),
      version: '2.22.2',
      blocks: [
        {
          type: 'paragraph',
          data: {
            text: JSON.parse(data)?.anonymized,
          },
        },
      ],
    })
    toggleModal()
  }, [data, refToUpdateOnChange, postData])

  return (
    <div
      className="relative"
      onClick={() => {
        if (showModal) {
          toggleModal()
        }
      }}
    >
      <Dialog>
        <DialogTrigger>
          <PrimaryButton
            onClick={data ? toggleModal : fetchData}
            disabled={isLoading || postData?.blocks?.length < 1}
            title={
              postData?.blocks?.length < 5
                ? 'Post content too short to summarize'
                : data
                  ? 'View summary'
                  : 'Summarize post'
            }
            variant="outlined"
            endIcon={
              <SparklesIcon
                className={clsx(
                  'h-5 w-5',
                  data ? 'text-blue-300' : 'text-blue-500'
                )}
                height={20}
              />
            }
            isLoading={isLoading}
          >
            {data ? 'Anonymized' : 'Anonymize'}
          </PrimaryButton>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {' '}
              {!postTitle ? 'Anonymized Text' : postTitle}
            </DialogTitle>
            <DialogDescription>
              <EditorJsRenderer
                data={
                  data ? JSON.parse(data)?.anonymized : 'Loading summary...'
                }
                isHtml={true}
              />
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className={'flex shrink-0 grow gap-1'}>
            <PrimaryButton
              disabled={!data || isLoading}
              endIcon={
                <SparklesIcon
                  className={clsx(
                    'h-5 w-5',
                    data ? 'text-blue-500' : 'text-primary'
                  )}
                  height={20}
                />
              }
              isLoading={isLoading}
              variant={'secondary'}
              className={''}
              onClick={() => {
                toggleModal()
                fetchData()
              }}
            >
              {data && 'Retry Anonymization'}
            </PrimaryButton>

            <PrimaryButton
              variant={'default'}
              disabled={!data || isLoading}
              onClick={useThis}
            >
              Update Message
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AnonymizeButton
