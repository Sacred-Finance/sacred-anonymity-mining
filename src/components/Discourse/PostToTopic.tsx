import axios from 'axios'
import { Topic } from '@components/Discourse/types'
import dynamic from 'next/dynamic'
import React, { useRef, useState } from 'react'
import EditorJS, { OutputData } from '@editorjs/editorjs'
import { useTranslation } from 'react-i18next'
import { NewPostForm } from '@components/NewPostForm'
import { toast } from 'react-toastify'
import { mutate } from 'swr'
import { getDiscourseData } from '@/lib/fetcher'
import { OutputDataToMarkDown } from '@components/Discourse/OutputDataToMarkDown'
const Editor = dynamic(() => import('../editor-js/Editor'), {
  ssr: false,
})
const PostToTopic = ({ topic }: { topic: Topic }) => {
  const { t } = useTranslation()
  const [description, setDescription] = useState<OutputData>(null)
  const editorReference = useRef<EditorJS>()

  const onSubmit = async () => {
    if (!description) return toast.error(t('error.emptyPost'))
    const raw = OutputDataToMarkDown(description)

    try {
      await axios.post('/api/discourse/postToTopic', {
        topic_id: topic.id,
        raw: raw,
      })
      toast.success(t('success.postCreated'))
      await mutate(getDiscourseData(topic.id))
    } catch (error) {
      toast.error(t('error.postNotCreated'))
      console.error(error)
    }
  }

  if (topic?.details?.created_by?.id === -1) return null

  return (
    <div>
      <NewPostForm
        isReadOnly={false}
        editorId={`${topic.id}_post`}
        description={description}
        setDescription={setDescription}
        handleSubmit={onSubmit}
        editorReference={editorReference}
        resetForm={() => {}}
        isSubmitting={false}
        title={false}
        isEditable={true}
        itemType={'post'}
        handlerType={'new'}
        formVariant={'default'}
        submitButtonText={t('button.post') as string}
        openFormButtonText={t('button.newPost') as string}
      />
    </div>
  )
}

export default PostToTopic
