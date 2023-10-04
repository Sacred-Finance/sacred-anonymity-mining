import axios from 'axios'
import { Post, Topic } from '@components/Discourse/types'
import React, { useRef, useState } from 'react'
import EditorJS, { OutputData } from '@editorjs/editorjs'
import { useTranslation } from 'react-i18next'
import { NewPostForm } from '@components/NewPostForm'
import { toast } from 'react-toastify'
import { OutputDataToMarkDown } from '@components/Discourse/OutputDataToMarkDown'

const PostToTopic = ({ topic, mutate }: { topic: Topic; mutate: (newPost: Post) => void }) => {
  const { t } = useTranslation()
  const [description, setDescription] = useState<OutputData>(null)
  const editorReference = useRef<EditorJS>()

  const onSubmit = async () => {
    if (!description) return toast.error(t('error.emptyPost'))
    const raw = OutputDataToMarkDown(description)

    try {
      const newPost = await axios.post('/api/discourse/postToTopic', {
        topic_id: topic.id,
        raw: raw,
        unlist_topic: false,
        nested_post: true,
        archetype: 'regular',
        whisper: false,
        is_warning: false,
        category: 4,
      })

      if (newPost.data.post) {
        toast.success(t('alert.postCreateSuccess'))
        mutate(newPost.data.post)
      }
      // mutate where key includes topic_id and post_id
    } catch (error) {
      toast.error(t('alert.postCreateFailed'))
      console.error(error)
    }
  }

  if (topic?.details?.created_by?.id === -1) return null

  return (
    <>
      <NewPostForm
        isReadOnly={false}
        classes={{
          rootOpen: 'fixed z-50 inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center',
          formBody: 'w-full h-full flex flex-col gap-4',
          editor: 'border rounded py-1 px-2 bg-white dark:bg-gray-800',
          submitButton: 'bg-green-500 text-white border-none rounded hover:bg-green-600',
          formContainerOpen:
            'bg-white dark:bg-gray-800 p-4 border border-gray-300 dark:border-gray-700 rounded shadow-lg w-full max-w-3xl',
          openFormButtonOpen: 'bg-primary-500 text-white opacity-0 hover:bg-primary-600',
        }}
        editorId={`${topic?.id}_post`}
        description={description}
        setDescription={setDescription}
        handleSubmit={onSubmit}
        editorReference={editorReference}
        resetForm={() => {
          // @ts-ignore
          editorReference.current.clear()
          setDescription(null)
        }}
        title={false}
        isEditable={true}
        itemType={'post'}
        actionType={'new'}
        submitButtonText={t('button.post') as string}
        openFormButtonText={t('button.newPost') as string}
      />
    </>
  )
}

export default PostToTopic
