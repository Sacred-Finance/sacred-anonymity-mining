import { useTranslation } from 'react-i18next'
import React from 'react'
import EditorJsRenderer from './editor-js/EditorJSRenderer'
import { CancelButton, PrimaryButton } from './buttons'
import { EyeIcon, PencilIcon } from '@heroicons/react/20/solid'
import dynamic from 'next/dynamic'
let Editor = dynamic(() => import('./editor-js/Editor'), {
  ssr: false
});

function PreviewButton(props: { onClick: () => void; previewVisible: boolean }) {
  return (
    <button
      onClick={props.onClick}
      className="flex items-center rounded-lg px-2.5 py-1 text-indigo-500 outline outline-indigo-500"
    >
      {props.previewVisible ? 'Show Editor' : 'Show Preview'}
      {props.previewVisible ? <PencilIcon className="ml-2 h-5 w-5" /> : <EyeIcon className="ml-2 h-5 w-5" />}
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
}) => {
  const { t } = useTranslation()

  const [isPreviewVisible, setIsPreviewVisible] = React.useState(false)
  const [isNewPostVisible, setIsNewPostVisible] = React.useState(false)

  return (
    <div className="mt-6 border bg-white/10 px-6 py-6 ">
      {!isNewPostVisible && (
        <button onClick={() => setIsNewPostVisible(true)} className="rounded-lg bg-indigo-500 px-6 py-2 text-white">
          {t('newPost')}
        </button>
      )}

      {isNewPostVisible && (
        <>
          <div className="my-4 text-xl font-bold">{t('newPost')}</div>
          <>
            <input
              className="mt-2  w-[50%] rounded border-2 border-gray-200 p-3"
              placeholder={t('placeholder.enterPostTitle')}
              value={postTitle}
              onChange={e => setPostTitle(e.target.value)}
            />
            <div className="h-100 mt-2 ">
              {isPreviewVisible ? (
                <div>
                  <div className="my-4 flex items-center justify-between gap-8 text-lg ">
                    <div className="my-4 text-xl font-bold"> Preview</div>
                    <PreviewButton
                      onClick={() => setIsPreviewVisible(!isPreviewVisible)}
                      previewVisible={isPreviewVisible}
                    />
                  </div>
                  <div className="h-96 cursor-not-allowed rounded-md">
                    <div className="prose mt-2 h-full w-full max-w-full rounded border-2 border-gray-200 px-6 py-0 text-white">
                      {postDescription && <EditorJsRenderer data={postDescription} />}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="my-4 flex items-center justify-between gap-8 text-lg">
                    <div className="my-4 text-xl font-bold"> Editor</div>
                    <PreviewButton
                      onClick={() => setIsPreviewVisible(!isPreviewVisible)}
                      previewVisible={isPreviewVisible}
                    />
                  </div>

                  <div className="h-96  rounded-md">
                    <Editor
                      data={postDescription}
                      postEditorRef={postEditorRef}
                      onChange={setPostDescription}
                      placeholder={t('placeholder.enterPostContent')}
                      holder={id}
                      className="prose mt-2 h-full w-full max-w-full rounded border-2 border-gray-200 p-0 text-white"
                    />
                  </div>
                </div>
              )}

              <div className={'mt-4 flex justify-between px-0'}>
                <CancelButton
                  onClick={() => {
                    setIsNewPostVisible(false)
                    clearInput()
                  }}
                >
                  {t('button.cancel')}
                </CancelButton>
                &nbsp;
                <PrimaryButton
                  onClick={addPost}
                  // disabled={!postTitle && !postDescription?.blocks?.length}
                  className="ml-4 rounded-lg bg-green-500 px-6 py-2 text-white"
                >
                  {isLoading ? <>loading</> : t('button.post')}
                </PrimaryButton>
              </div>
            </div>
          </>
        </>
      )}
    </div>
  )
}
