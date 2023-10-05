import React from 'react'
import { useGPTServerAnalysis } from '../../hooks/useGPTServerAnalysis' // Import the custom hook
import { PrimaryButton } from '@components/buttons/PrimaryButton'
import { SparklesIcon } from '@heroicons/react/20/solid'
import EditorJsRenderer from '@components/editor-js/EditorJSRenderer'
import clsx from 'clsx'
import { Template } from '@pages/api/gpt-server/logos-ai'

interface SummaryButtonProps {
  postData: string
  postTitle?: string
}

const SummaryButton: React.FC<SummaryButtonProps> = ({ postData, postTitle }) => {
  const { isLoading, data, error, fetchData } = useGPTServerAnalysis({ postData, template: Template.Summarize })
  const [showModal, setShowModal] = React.useState(false)

  const toggleModal = () => {
    setShowModal(!showModal)
  }

  React.useEffect(() => {
    if (data) {
      setShowModal(true)
    }
  }, [data])

  return (
    <div
      className="relative w-fit"
      onClick={() => {
        if (showModal) {
          toggleModal()
        }
      }}
    >
      <PrimaryButton
        onClick={data ? toggleModal : fetchData}
        disabled={isLoading || postData.length < 25}
        title={postData.length < 25 ? 'Post content too short to summarize' : data ? 'View summary' : 'Summarize post'}
        endIcon={<SparklesIcon className={clsx('h-5 w-5', data ? 'text-white' : 'text-gray-500')} height={20} />}
        isLoading={isLoading}
      >
        {data ? 'Summary' : 'Summarize'}
      </PrimaryButton>

      {showModal && (
        <div className="fixed inset-0 z-[51] flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="relative w-1/2 overflow-y-auto rounded bg-white dark:bg-gray-600 200 p-8 text-center"
            onClick={e => {
              e.stopPropagation()
            }}
          >
            <button onClick={toggleModal} className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              Close
            </button>
            <span className={'text-xl font-bold '}>{!postTitle ? 'Summary' : postTitle}</span>
            <br />
            <br />
            {error && (
              <>
                <div className="text-red-500">{error}</div>
                <div className="text-gray-500">Please try again later.</div>
              </>
            )}
            <EditorJsRenderer data={data ? data.html : 'Loading summary...'} isHtml={true} />
          </div>
        </div>
      )}
    </div>
  )
}

export default SummaryButton
