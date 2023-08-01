import { useForm } from 'react-hook-form'
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
const Editor = dynamic(() => import('../editor-js/Editor'), {
  ssr: false,
})
const PostToTopic = ({ topic }: { topic: Topic }) => {
  const { t } = useTranslation()
  const [description, setDescription] = useState<OutputData>(null)
  const editorReference = useRef<EditorJS>()

  const onSubmit = async () => {
    if (!description) return toast.error(t('error.emptyPost'))

    const raw = description.blocks.reduce((acc, block, idx) => {
      let content = ''
      if (idx !== 0) {
        acc += '\n'
      }

      switch (block.type) {
        case 'paragraph':
          content = block.data.text
          break
        case 'header':
          content = `# ${block.data.text}`
          break
        case 'list':
          content = block.data.items.reduce((acc, item) => acc + `- ${item}\n`, '')
          break
        case 'code':
          content = `\`\`\`${block.data.language}\n${block.data.code}\n\`\`\``
          break
        case 'delimiter':
          content = `---`
          break
        case 'image':
          content = `![${block.data.caption}](${block.data.file.url})`
          break
        case 'table':
          // Need more complex handling for tables here...
          break
        case 'quote':
          content = `> ${block.data.text}`
          break
        case 'warning':
          content = `> ${block.data.title}\n${block.data.message}`
          break
        case 'linkTool':
          content = `[${block.data.meta.title}](${block.data.link})` // Updated link structure
          break
        case 'embed':
          content = `\`${block.data.html}\`` // Enclosed HTML with backticks
          break
        case 'raw':
          content = `${block.data.html}`
          break
        case 'checklist':
          content = block.data.items.reduce((acc, item) => acc + `- [${item.checked ? 'x' : ' '}] ${item.text}\n`, '')
          break
        default:
          content = ''
      }

      acc += content
      return acc
    }, '')

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

  return (
    <div>
      <label htmlFor="content" className="block text-sm font-medium text-gray-700">
        Content
      </label>
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
      />
    </div>
  )
}

export default PostToTopic
