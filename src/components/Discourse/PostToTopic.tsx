import axios from 'axios'
import { Post, Topic } from '@components/Discourse/types'
import React, { useRef, useState } from 'react'
import EditorJS, { OutputData } from '@editorjs/editorjs'
import { useTranslation } from 'react-i18next'
import { NewPostForm } from '@components/NewPostForm'
import { toast } from 'react-toastify'
import { OutputDataToMarkDown } from '@components/Discourse/OutputDataToMarkDown'
import { useFetchBalance } from '@/hooks/useFetchBalance'
import { useRouter } from 'next/router'

const PostToTopic = ({
  topic,
  mutate,
  readonly = false,
}: {
  topic: Topic
  mutate: (newPost: Post) => void
  readonly?: boolean
}) => {
  console.log('topic', readonly)
  const { t } = useTranslation()
  const [description, setDescription] = useState<OutputData | null>(null)
  const [selectedToReveal, setSelectedToReveal] = useState(0)
  const { fetchBalance } = useFetchBalance()
  const router = useRouter()
  const { groupId } = router.query
  const onSubmit = async () => {
    if (!description) return toast.error(t('error.emptyPost'))
    let raw = OutputDataToMarkDown(description)

    if (selectedToReveal > 0) {
      try {
        const balance = await fetchBalance()
        if (balance) {
          const percentageToReveal = (balance * selectedToReveal) / 100
          const toAppend = `<br><br><br><i>Sacred Bot: User has chosen to reveal ${percentageToReveal} tokens. </i>`
          raw = raw + toAppend
        }
      } catch (error) {
        console.error(error)
        return
      }
    }

    try {
      const newPost = await axios.post(`/api/discourse/${groupId}/postToTopic`, {
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
          isReadOnly={readonly}
          classes={{
            rootOpen: 'fixed z-50 inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center',
            formBody: 'w-full h-full flex flex-col gap-4',
            editor: 'border rounded py-1 px-2 bg-white dark:bg-gray-800',
            submitButton: 'bg-green-500 text-white border-none rounded hover:bg-green-600',
            formContainerOpen:
              'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg w-full max-w-3xl',
            openFormButtonOpen: 'bg-primary-500 text-white opacity-0 hover:bg-primary-600',
          }}
          editorId={`${topic?.id}_post`}
          description={description}
          setDescription={setDescription}
          handleSubmit={onSubmit}
          resetForm={() => {
            // @ts-ignore
            setDescription(null)
          }}
          title={false}
          isEditable={true}
          itemType={'post'}
          actionType={'new'}
          submitButtonText={t('button.post') as string}
          openFormButtonText={t('button.newPost') as string}
          tokenBalanceReveal={{
            selectedValue: selectedToReveal,
            onSelected(value) {
              setSelectedToReveal(value)
            },
          }}
        />
    </>
  )
}

export default PostToTopic
