import React, { useState } from 'react'
import axios from 'axios'
import { CircularLoader } from '@components/JoinCommunityButton'
import { SparklesIcon } from '@heroicons/react/20/solid'
import EditorJsRenderer from '@components/editor-js/EditorJSRenderer'
import clsx from 'clsx'
interface SummaryButtonProps {
  postData: string
  postTitle?: string
}

const SummaryButton: React.FC<SummaryButtonProps> = ({ postData, postTitle }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  const fetchSummary = async () => {
    setIsLoading(true)
    setShowModal(false) // Hide modal while fetching new summary

    try {
      const response = await axios.post('/api/gpt-server/summary', { text: postData })
      setSummary(response.data.html)
    } catch (error) {
      setError('Error fetching summary')
    } finally {
      setIsLoading(false)
      setShowModal(true) // Show modal once fetched
    }
  }

  const toggleModal = () => {
    setShowModal(!showModal)
  }

  return (
    <div
      className="relative"
      onClick={() => {
        if (showModal) {
          toggleModal()
        }
      }}
    >
      <button
        onClick={summary ? toggleModal : fetchSummary}
        disabled={isLoading}
        className={clsx(
          'm-1 flex items-center gap-2 rounded px-2 py-1 text-blue-500 outline outline-2  outline-blue-500 hover:bg-blue-600 hover:text-white focus:outline-none',
          summary ? 'bg-blue-300 text-white' : ''
        )}
      >
        Summary{' '}
        {isLoading ? (
          <CircularLoader />
        ) : (
          <SparklesIcon className={clsx('h-5 w-5', summary ? 'text-white' : 'text-blue-500')} height={20} />
        )}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50  flex items-center justify-center  bg-black  bg-opacity-50">
          <div
            className="relative w-1/2  overflow-y-auto rounded-lg bg-white p-8 text-center"
            onClick={e => {
              e.stopPropagation()
            }}
          >
            <button onClick={toggleModal} className="absolute right-2 top-2 text-gray-400 hover:text-gray-600">
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

            <EditorJsRenderer data={summary ? summary : 'Loading summary...'} isHtml={true} />
          </div>
        </div>
      )}
    </div>
  )
}

export default SummaryButton
