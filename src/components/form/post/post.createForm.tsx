import React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PostContentTextarea, PostTitleInput } from './post.components'
import { CommentCreationSchema, PostCreationSchema } from '@components/form/post/post.schema'
import { toast } from 'react-toastify'
import { useAccount } from 'wagmi'
import { PrimaryButton } from '@components/buttons'
import usePost from '@/hooks/usePost'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shad/ui/accordion'
import { Textarea } from '@/shad/ui/textarea'
import type { Group, Item } from '@/types/contract/ForumInterface'
import type { KeyedMutator } from 'swr'
import type { GroupWithPostDataResponse } from '@pages/api/groupWithPostData'
import type { GroupWithPostAndCommentDataResponse } from '@pages/api/groupWithPostAndCommentData'

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

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col space-y-4">
        {!post && <PostTitleInput form={methods} />}
        <PostContentTextarea form={methods} />
        <Accordion type="single" className="mt-4">
          <AccordionItem value="content">
            <AccordionTrigger>Content</AccordionTrigger>
            <AccordionContent>
              <Textarea
                className="bg-black/50"
                readOnly={true}
                hidden
                value={JSON.stringify(methods.watch('content'))}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <PrimaryButton
          type="submit"
          disabled={methods.formState.isSubmitting || !methods.formState.isValid}
          isLoading={methods.formState.isSubmitting}
        >
          Create
        </PrimaryButton>
      </form>
    </FormProvider>
  )
}
