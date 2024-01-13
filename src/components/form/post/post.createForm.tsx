import React, { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PostContentTextarea, PostTitleInput } from './post.components'
import type { PostCreationType } from '@components/form/post/post.schema'
import { CommentCreationSchema, CommentCreationType, PostCreationSchema } from '@components/form/post/post.schema'
import { toast } from 'react-toastify'
import { useAccount } from 'wagmi'
import { PrimaryButton } from '@components/buttons'
import usePost from '@/hooks/usePost'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shad/ui/accordion'
import { Textarea } from '@/shad/ui/textarea'

export default function PostCreateForm({ post, group, mutate }) {
  const methods = useForm<PostCreationType | CommentCreationType>({
    resolver: zodResolver(post ? CommentCreationSchema : PostCreationSchema),
    mode: 'onChange',
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
    console.log(data)
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

    // Optimistic UI update
    mutate(data => {
      if (data.posts) {
        return {
          ...data,
          posts: [...data?.posts, optimisticPost],
        }
      } else {
        return {
          ...data,
          comments: [...data?.comments, optimisticPost],
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
          toast.error(err?.message ?? 'An error occurred while creating the post')
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
  useEffect(() => {
    console.log(methods.formState.errors)
  }, [methods.formState.errors])

  useEffect(() => {
    methods.trigger()
  }, [methods])
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
                className={'bg-black/50'}
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
