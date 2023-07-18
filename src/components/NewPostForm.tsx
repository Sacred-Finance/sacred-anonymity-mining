import { useTranslation } from 'react-i18next'
import React from 'react'
import EditorJsRenderer from './editor-js/EditorJSRenderer'
import { CancelButton, PrimaryButton } from './buttons'
import { EyeIcon, PencilIcon, PlusIcon } from '@heroicons/react/20/solid'
import dynamic from 'next/dynamic'
import { CircularLoader } from '@components/JoinCommunityButton'

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
  readOnly,
  addPost,
  isComment = false,
  isEdit = false,
}) => {
  const { t } = useTranslation()
  const [isPreview, setIsPreview] = React.useState(false)
  const [isNewPostOpen, setIsNewPostOpen] = React.useState(false)

  return (
    <div className="mt-6 h-auto rounded-lg border bg-white/10 p-6 shadow-lg">
      {!isNewPostOpen && (
        <button
          onClick={() => setIsNewPostOpen(true)}
          className="flex items-center rounded bg-indigo-100 p-2 text-indigo-500 transition-colors duration-150 hover:bg-indigo-200"
        >
          <PlusIcon className="mr-2 h-5 w-5" />
          {isEdit ? t(isComment ? 'editComment' : 'editPost') : t(isComment ? 'newComment' : 'newPost')}
        </button>
      )}
      {isNewPostOpen && (
        <div>
          <div className="mb-4 text-2xl font-semibold">
            {' '}
            {isEdit ? t(isComment ? 'editComment' : 'editPost') : t(isComment ? 'newComment' : 'newPost')}
          </div>

          {postTitle !== false && (
            <input
              className="mb-4 w-full rounded border-gray-200 p-3 text-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={t(isComment ? 'placeholder.enterComment' : 'placeholder.enterPostTitle')}
              value={postTitle}
              onChange={e => setPostTitle(e.target.value)}
            />
          )}
          <div>
            <div className="mb-2 flex items-center justify-between text-lg">
              <div className="font-semibold"> {isPreview ? 'Preview' : 'Editor'}</div>
              <ToggleButton onClick={() => setIsPreview(!isPreview)} isPreview={isPreview} />
            </div>
            <div className="z-50 rounded border-gray-200  p-6 text-white ">
              {isPreview ? (
                postDescription && <EditorJsRenderer data={postDescription} />
              ) : (
                <Editor
                  data={postDescription}
                  editorRef={postEditorRef}
                  onChange={setPostDescription}
                  readOnly={readOnly}
                  placeholder={
                    isEdit
                      ? t(isComment ? 'placeholder.editComment' : 'placeholder.editPost')
                      : t(isComment ? 'placeholder.newComment' : 'new post form')
                  }
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
                isLoading={isLoading}
                className=" rounded  bg-green-500  p-3 text-white transition-colors duration-150 hover:bg-green-600"
              >
                {isEdit
                  ? t(isComment ? 'button.editComment' : 'button.editPost')
                  : t(isComment ? 'button.comment' : 'button.post')}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
