import { useTranslation } from 'react-i18next'
import React from 'react'
import EditorJsRenderer from './editor-js/EditorJSRenderer'
import { CancelButton, PrimaryButton } from './buttons'
import { EyeIcon, PencilIcon, PlusIcon } from '@heroicons/react/20/solid'
import dynamic from 'next/dynamic'

const Editor = dynamic(() => import('./editor-js/Editor'), {
  ssr: false,
})

function ToggleButton({ onClick, isPreview }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center rounded bg-indigo-100 p-2 text-indigo-500 transition-colors duration-150 hover:bg-indigo-200"
    >
      {isPreview ? 'Show Editor' : 'Show Preview'}
      {isPreview ? <PencilIcon className="ml-2 h-5 w-5" /> : <EyeIcon className="ml-2 h-5 w-5" />}
    </button>
  )
}
export const NewPostForm = ({
  id,
  postEditorRef,
  postTitle,
  setPostTitle,
  postDescription,
  setPostDescription,
  isLoading,
  clearInput,
  addPost,
  isComment = false,
}) => {
  const { t } = useTranslation()
  const [isPreview, setIsPreview] = React.useState(false)
  const [isNewPostOpen, setIsNewPostOpen] = React.useState(false)

  return (
    <div className="mt-6 rounded-lg border bg-white/10 p-6 shadow-lg h-auto">
      {!isNewPostOpen && (
        <button
          onClick={() => setIsNewPostOpen(true)}
          className="flex items-center rounded bg-indigo-500 p-3 text-white transition-colors duration-150 hover:bg-indigo-600"
        >
          <PlusIcon className="mr-2 h-5 w-5" />
          {t(isComment ? 'newComment' : 'newPost')}
        </button>
      )}
      {isNewPostOpen && (
        <div>
          <div className="mb-4 text-2xl font-semibold">   {t(isComment ? 'newComment' : 'newPost')}</div>

          {postTitle !== false && (
            <input
              className="mb-4 w-full rounded border-gray-200 p-3 text-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder= {t(isComment ? 'placeholder.enterComment' : 'placeholder.enterPostTitle')}
              value={postTitle}
              onChange={e => setPostTitle(e.target.value)}
            />
          )}
          <div>
            <div className="mb-2 flex items-center justify-between text-lg">
              <div className="font-semibold"> {isPreview ? 'Preview' : 'Editor'}</div>
              <ToggleButton onClick={() => setIsPreview(!isPreview)} isPreview={isPreview} />
            </div>
            <div className="z-50 h-96 rounded border-gray-200  p-6 text-white ">
              {isPreview ? (
                postDescription && <EditorJsRenderer data={postDescription} />
              ) : (
                <Editor
                  data={postDescription}
                  editorRef={postEditorRef}
                  onChange={setPostDescription}
                  placeholder={t(isComment ? 'placeholder.newComment' : 'new post form')}
                  holder={id}
                />
              )}
            </div>
            <div className="mt-4 flex justify-between">
              <CancelButton
                onClick={() => {
                  setIsNewPostOpen(false)
                  clearInput()
                }}
              >
                {t('button.cancel')}
              </CancelButton>
              <PrimaryButton
                onClick={addPost}
                className="ml-4 rounded bg-green-500 p-3 text-white transition-colors duration-150 hover:bg-green-600"
              >
                {isLoading ? <>loading</> : t(isComment ? 'button.comment' :'button.post')}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
