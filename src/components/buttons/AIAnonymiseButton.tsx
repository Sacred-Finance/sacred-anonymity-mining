import React from 'react'
import { useGPTServerAnalysis } from '../../hooks/useGPTServerAnalysis' // Import the custom hook
import { PrimaryButton } from '@components/buttons/PrimaryButton'
import { SparklesIcon } from '@heroicons/react/20/solid'
import EditorJsRenderer from '@components/editor-js/EditorJSRenderer'
import clsx from 'clsx'
import { Template } from '@pages/api/gpt-server/logos-ai'
import { EditorJsType } from '@components/NewPostForm'

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
        endIcon={<SparklesIcon className={clsx('h-5 w-5', data ? 'text-white' : 'text-blue-500')} height={20} />}
        isLoading={isLoading}
      >
        {data ? 'Anonymized' : 'Anonymize'}
      </PrimaryButton>

      {showModal && (
        <div className="fixed inset-0 z-[52] flex items-center justify-center bg-black/50">
          <div
            className="relative flex min-h-[400px] w-1/2 flex-col justify-between overflow-y-auto rounded-lg bg-gray-950 p-4"
            onClick={e => {
              e.stopPropagation()
            }}
          >
            <span className={'text-xl font-bold '}>{!postTitle ? 'Anonymized Text' : postTitle}</span>
            {error && (
              <>
                <div className="text-red-500">{error}</div>
                <div className="text-gray-500">Please try again later.</div>
              </>
            )}

            {/*linear gradient*/}
            <div
              className="flex gap-4
            rounded-lg bg-secondary/50 bg-opacity-50 bg-gradient-to-r from-50% via-50% to-100% p-2
            "
            >
              <div className={'flex flex-col border  bg-secondary/50 p-2'}>
                <span className={'text-xl  uppercase'}>Original</span>
                <span className={''}>
                  <EditorJsRenderer
                    data={data ? convertEditorJsTypeToString(postData) : 'Loading summary...'}
                    isHtml={true}
                  />
                </span>
              </div>
              <div className={'flex flex-col border bg-secondary/50 p-2'}>
                <span className={'text-xl uppercase'}>Anonymized</span>
                <EditorJsRenderer data={data ? JSON.parse(data)?.anonymized : 'Loading summary...'} isHtml={true} />
              </div>
            </div>

            <div className={'flex justify-between gap-4'}>
              <PrimaryButton variant={'destructive'} onClick={toggleModal}>
                Close
              </PrimaryButton>
              <PrimaryButton
                className={'text-white'}
                endIcon={<SparklesIcon className={clsx('h-5 w-5', data ? 'text-white' : 'text-primary')} height={20} />}
                variant={'outline'}
                onClick={() => {
                  toggleModal()
                  fetchData()
                }}
              >
                Retry Anonymization
              </PrimaryButton>

              <PrimaryButton variant={'default'} disabled={!data} onClick={useThis}>
                Update Message
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnonymizeButton
