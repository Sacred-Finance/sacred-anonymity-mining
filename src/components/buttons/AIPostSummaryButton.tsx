import React, { useState } from 'react'
import axios from 'axios'
import { CircularLoader } from '@components/JoinCommunityButton'
import { EyeIcon, SparklesIcon } from '@heroicons/react/20/solid'
import EditorJsRenderer from '@components/editor-js/EditorJSRenderer'
import { OutputData } from '@editorjs/editorjs'
const editorJsHtml = require('editorjs-html')
const EditorJsToHtml = editorJsHtml()
interface SummaryButtonProps {
  postData: string
}

const SummaryButton: React.FC<SummaryButtonProps> = ({ postData }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  const fetchSummary = async () => {
    setIsLoading(true)
    setShowModal(false) // Hide modal while fetching new summary

    try {
      const response = await axios.post('/api/gpt-server/summary', { text: postData })
      setSummary(response.data.summary)
    } catch (error) {
      console.error('Error fetching summary:', error)
      setSummary('Error fetching summary')
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
        className="m-1 flex items-center gap-2 rounded px-2 py-1 text-blue-500 outline outline-2  outline-blue-500 hover:bg-blue-600 hover:text-white focus:outline-none"
      >
        Summary {isLoading ? <CircularLoader /> : <SparklesIcon height={20} />}
      </button>

      {showModal && (
        <div className="fixed inset-0  z-50 flex justify-center  bg-black  bg-opacity-50">
          <div
            className="relative w-1/2  overflow-y-auto rounded-lg bg-white p-8 text-center"
            onClick={e => {
              e.stopPropagation()
            }}
          >
            <button onClick={toggleModal} className="absolute right-2 top-2 text-gray-400 hover:text-gray-600">
              Close
            </button>
            <h4 className="mb-4 text-lg font-semibold">Summary:</h4>
            <EditorJsRenderer data={summary} onlyPreview={false} />
          </div>
        </div>
      )}
    </div>
  )
}

export default SummaryButton
