import React, { useRef, useState } from 'react'
import { NewPostForm, NewPostFormProps } from '@components/NewPostForm'
import axios from 'axios'
import { toast } from 'react-toastify'
import { getDiscourseData } from '@/lib/fetcher'
import { mutate } from 'swr'
import { OutputDataToMarkDown } from '@components/Discourse/OutputDataToMarkDown'
import { useTranslation } from 'react-i18next'
import EditorJS, { OutputData } from '@editorjs/editorjs'
import { Topic } from '@components/Discourse/types'
import { useFetchBalance } from '@/hooks/useFetchBalance'
import { useRouter } from 'next/router'

const ReplyToPost = ({
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
  const [description, setDescription] = useState<OutputData>(null)
  const editorReference = useRef<EditorJS>()
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
      editorReference={editorReference}
      title={false}
      setTitle={() => {}}
      description={description}
      setDescription={setDescription}
      resetForm={() => {
        // @ts-ignore
        editorReference.current.clear()
        setDescription(null)
      }}
      isReadOnly={false}
      isEditable={true}
      handleSubmit={onSubmit}
      openFormButtonText={'Reply'}
      handlerType={'new'}
      submitButtonText={'Submit'}
      {...formProps}
      classes={{
        openFormButton: 'border-gray-300 bg-gray-600 text-white hover:bg-gray-700 transition-colors duration-150 ',
        formContainer: 'bg-white p-4 border border-gray-300 rounded shadow-lg absolute z-20  ',
        rootClosed: '!p-0 !m-0 absolute ',
        formContainerOpen: 'w-full max-w-3xl mx-auto z-50 -top-1/2 right-0 sticky bottom-0',
        cancelButton: 'text-gray-500 hover:text-gray-700 bg-red-400 text-white',
        openFormButtonClosed: 'self-end mr-3 bg-primary-500',
        root: '!z-50 relative',
        ...formProps?.classes,
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

export default ReplyToPost
