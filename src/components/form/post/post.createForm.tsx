import React, { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PostContentTextarea, PostTitleInput } from './post.components'
import { CommentCreationSchema, PostCreationSchema } from '@components/form/post/post.schema'
import { toast } from 'react-toastify'
import { useAccount } from 'wagmi'
import { PrimaryButton } from '@components/buttons'
import usePost from '@/hooks/usePost'
import type { Group, Item } from '@/types/contract/ForumInterface'
import type { KeyedMutator } from 'swr'
import type { GroupWithPostDataResponse } from '@pages/api/groupWithPostData'
import type { GroupWithPostAndCommentDataResponse } from '@pages/api/groupWithPostAndCommentData'
import { MessageCircle, SendHorizonalIcon } from 'lucide-react'
import { Switch } from '@/shad/ui/switch'
import { Label } from '@/shad/ui/label'
import EditorJsRenderer from '@components/editor-js/EditorJSRenderer'

export type MutateType<T> = T extends undefined
  ? KeyedMutator<GroupWithPostDataResponse>
  : KeyedMutator<GroupWithPostAndCommentDataResponse>

type PostCreateFormProps<T> = {
  post?: T
  group: Group
  mutate: MutateType<T>
}

export default function PostCreateForm({
  post,
  group,
  mutate,
  handleClose,
}: PostCreateFormProps<Item | undefined> & { handleClose: () => void }) {
  const schema = post ? PostCreationSchema : CommentCreationSchema
  const methods = useForm({
    resolver: zodResolver(schema),
    mode: 'all',
  })
  const { address } = useAccount()

  const { createNewPost } = usePost({
    group,
  })

  const onSubmit = async () => {
    const data = methods.getValues()
    if (!address) {
      toast.error('Please connect your wallet')
      return
    }
    const optimisticPost = {
      kind: 0,
      id: '0',
      parentId: '0',
      groupId: group.id,
      createdAtBlock: 0,
      childIds: [],
      upvote: 0,
      downvote: 0,
      note: address,
      removed: false,
      title: data.title,
      isMutating: true,
      description: data.description,
    }
    handleClose()

    // Optimistic UI update
    await mutate((data: { posts: Item[]; comments: Item[] }) => {
      if (data.posts) {
        return {
          ...data,
          posts: [optimisticPost, ...data.posts],
        }
      } else {
        return {
          ...data,
          comments: [optimisticPost, ...data.comments],
        }
      }
    }, false)

    const description = methods.getValues().description
    const title = methods.getValues().title
    try {
      await createNewPost({
        content: {
          title,
          description,
        },
        post,
        onSuccessCallback: () => {
          mutate && mutate()
        },
        onErrorCallback: err => {
          console.error(err)
          mutate((data: { posts: Item[]; comments: Item[] }) => {
            if (data.posts) {
              return {
                ...data,
                posts: data?.posts.filter((post: Item) => post.id !== optimisticPost.id),
              }
            } else {
              return {
                ...data,
                comments: data?.comments.filter((post: Item) => post.id !== optimisticPost.id),
              }
            }
          }, false)
          if (err instanceof Error) {
            toast.error(err?.message ?? 'An error occurred while creating the post')
          }
        },
      })
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        methods.setError('root', {
          type: 'manual',
          message: error.message,
        })
        toast.error(error.message)
      }
    }
  }
  const [preview, setPreview] = useState(false)
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="mx-2 flex h-full grow flex-col justify-between space-y-4"
      >
        <span className="mb-10 text-4xl">Create a new{post ? ' comment' : ' post'}</span>
        {!post && <PostTitleInput form={methods} />}

        <div className="flex h-full grow flex-col justify-stretch ">
          <PostContentTextarea
            form={methods}
            label={
              <>
                <div className="flex items-center justify-between space-x-2">
                  Content
                  <span className="flex items-center gap-2">
                    <Switch
                      id="preview-content"
                      onCheckedChange={e => {
                        setPreview(e)
                      }}
                    />
                    <Label htmlFor="preview-content">Preview Mode</Label>
                  </span>
                </div>
              </>
            }
            placeholder="Start writing your post..."
            value={methods.watch('description')}
          />
        </div>

        {preview && (
          <div className="relative flex h-full max-h-fit grow flex-col bg-black/50 p-8">
            <EditorJsRenderer data={methods.watch('description')} />
          </div>
        )}
        <MessageCircle
          className="absolute left-1/2  top-1/2 z-[-1] size-96 -translate-x-1/2
        -translate-y-1/2 text-foreground/5"
        />
        <div className=" flex-1 grow" />
        <PrimaryButton
          type="submit"
          className="group flex items-center justify-center gap-2 md:w-fit md:self-end"
          disabled={
            methods.formState.isSubmitting || !methods.formState.isValid || (!methods.getValues('title') && !post)
          }
          isLoading={methods.formState.isSubmitting}
          endIcon={<SendHorizonalIcon className="h-5 w-5 transition-all duration-200 group-hover:scale-105" />}
        >
          Create
        </PrimaryButton>
      </form>
    </FormProvider>
  )
}
