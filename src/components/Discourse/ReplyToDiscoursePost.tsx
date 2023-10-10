import React, { useRef, useState } from 'react'
import { NewPostForm, NewPostFormProps } from '@components/NewPostForm'
import axios from 'axios'
import { toast } from 'react-toastify'
import { OutputDataToMarkDown } from '@components/Discourse/OutputDataToMarkDown'
import { useTranslation } from 'react-i18next'
import EditorJS, { OutputData } from '@editorjs/editorjs'
import { Post, Topic } from '@components/Discourse/types'
import { useFetchBalance } from '@/hooks/useFetchBalance'
import { useRouter } from 'next/router'
import { mutate } from 'swr'

const ReplyToDiscoursePost = ({
  post,
  formProps,
  addReplyToPosts,
}: {
  post: Topic['post_stream']['posts'][0]
  formProps?: Partial<NewPostFormProps>
  addReplyToPosts?: (newPost: Topic['post_stream']['posts'][0]) => void
}) => {
  const { t } = useTranslation()
  const router = useRouter()
  const { groupId, topicId } = router.query
  const editorReference = useRef<EditorJS>()
  const [description, setDescription] = useState<OutputData | null>(null)
  const [selectedToReveal, setSelectedToReveal] = useState(0)
  const { fetchBalance } = useFetchBalance();
  const onSubmit = async () => {
    if (!description) return toast.error(t('error.emptyPost'))
    let raw = OutputDataToMarkDown(description)

    if (selectedToReveal > 0) {
      try {
        const balance = await fetchBalance();
        if (balance) {
          const percentageToReveal = balance * selectedToReveal / 100;
          const toAppend = `<br><br><br><i>Sacred Bot: User has chosen to reveal ${percentageToReveal} tokens. </i>`;
          raw = raw + toAppend;
        }
      } catch (error) {
        console.error(error);
        return;
      }
    }
    try {
      const newPost = await axios.post(`/api/discourse/${groupId}/postToTopic`, {
        topic_id: post.topic_id,
        reply_to_post_number: post.post_number,
        raw: raw,
        unlist_topic: false,
        nested_post: true,
        archetype: 'regular',
        whisper: false,
        is_warning: false,
        category: 4,
      })
      toast.success(t('alert.postCreateSuccess'))
      if (addReplyToPosts) {
        addReplyToPosts(newPost.data.post as Topic['post_stream']['posts'][0])
      }
      // await mutate(`/api/discourse/${post.topic_id}`)
      await mutate(`/api/discourse/${groupId}/${post.topic_id}/posts/${newPost.data.post.post_number}`) // load in post
    } catch (error) {
      toast.error(t('alert.postCreateFailed'))
      console.error(error)
    }
  }

  return (
    <NewPostForm
      editorId={`${post.id}_post`}
      title={false}
      setTitle={() => {}}
      description={description}
      setDescription={setDescription}
      resetForm={() => {
        setDescription(null)
      }}
      isReadOnly={false}
      isEditable={true}
      handleSubmit={onSubmit}
      openFormButtonText={'Reply'}
      actionType={'new'}
      showButtonWhenFormOpen={true}
      submitButtonText={'Submit'}
      {...formProps}
      classes={{
        rootOpen: 'fixed z-50 inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center',
        formBody: 'w-full h-full flex flex-col gap-4',
        editor: 'border rounded py-1 px-2 bg-white dark:bg-gray-800',
        submitButton: 'bg-green-500 text-white border-none rounded hover:bg-green-600',
        formContainerOpen:
          'bg-white dark:bg-gray-800 p-4 border border-gray-300 dark:border-gray-700 rounded shadow-lg w-full max-w-3xl',
        openFormButtonOpen: 'bg-primary-500 text-white opacity-0 hover:bg-primary-600',
      }}
      tokenBalanceReveal={{
        selectedValue: selectedToReveal,
        onSelected(value) {
          setSelectedToReveal(value)
        },
      }}
    />
  )
}

export default ReplyToDiscoursePost
