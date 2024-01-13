import React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PostContentTextarea, PostTitleInput } from './post.components'
import { CommentCreationSchema, PostCreationSchema } from '@components/form/post/post.schema'
import { toast } from 'react-toastify'
import { useAccount } from 'wagmi'
import { usePost } from '@/hooks/usePost'
import { PrimaryButton } from '@components/buttons'
import type { Group, Item } from '@/types/contract/ForumInterface'
import type { KeyedMutator } from 'swr'
import type { GroupWithPostAndCommentDataResponse } from '@pages/api/groupWithPostAndCommentData'
import type { GroupWithPostDataResponse } from '@pages/api/groupWithPostData'

type MutateType<T> = T extends undefined
  ? KeyedMutator<GroupWithPostDataResponse>
  : KeyedMutator<GroupWithPostAndCommentDataResponse>

type PostCreateFormProps<T> = {
  post?: T
  group: Group
  mutate: MutateType<T>
}

export default function PostCreateForm<T extends Item | undefined>({ post, group, mutate }: PostCreateFormProps<T>) {
  const schema = post ? CommentCreationSchema : PostCreationSchema
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: post?.title ?? '',
    },
  })

  console.log('post.createform', post)
  const { address } = useAccount()

  const { createPost } = usePost({
    group,
  })

  const onSubmit = async data => {
    if (!address) {
      toast.error('Please connect your wallet')
      return
    }
    // validate the data
    if (methods.formState.isSubmitting) {
      return
    }

    if (methods.formState.errors.root) {
      toast.error('Please fix the errors in the form')
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

    await mutate(data => {
      console.log('post.createform mutate', data)
      if (post) {
        return {
          ...data,
          comments: [...data.comments, optimisticPost],
        }
      } else {
        return {
          ...data,
          posts: [...data.posts, optimisticPost],
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
