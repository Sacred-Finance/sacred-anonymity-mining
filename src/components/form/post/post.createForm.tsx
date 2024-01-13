import React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PostContentTextarea, PostTitleInput } from './post.components'
import type { CommentCreationType, PostCreationType } from '@components/form/post/post.schema'
import { CommentCreationSchema, PostCreationSchema } from '@components/form/post/post.schema'
import { toast } from 'react-toastify'
import { useAccount } from 'wagmi'
import { PrimaryButton } from '@components/buttons'
import usePost from '@/hooks/usePost'
import type { Item } from '@/types/contract/ForumInterface'

export default function PostCreateForm({ post, group, mutate, handleClose }) {
  const methods = useForm<PostCreationType | CommentCreationType>({
    resolver: zodResolver(post ? CommentCreationSchema : PostCreationSchema),
    defaultValues: {
      ...(!post && {
        title: 'Awesome Post',
      }),
    },
  })
  const { address } = useAccount()

  const { createPost } = usePost({
    group,
  })

  const onSubmit = async data => {
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
      description: data.content,
    }
    handleClose()

    // Optimistic UI update
    mutate((data: { posts: Item[]; comments: Item[] }) => {
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
    try {
      await createPost({
        post: post,
        content: {
          title: data.title,
          description: data.content,
        },
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
      // roll back
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

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col space-y-4">
        {!post && <PostTitleInput form={methods} />}
        <PostContentTextarea form={methods} />
        <PrimaryButton type="submit" isLoading={methods.formState.isSubmitting}>
          Create
        </PrimaryButton>
      </form>
    </FormProvider>
  )
}
