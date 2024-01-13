import React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  PollContentTextarea,
  PollDurationInput,
  PollNumericRatingInput,
  PollOptionsInput,
  PollTitleInput,
  PollTypeSelect,
} from './poll.components'
import type { PollCreationType } from '@components/form/poll/poll.schema'
import { PollCreationSchema, transformStringToOutputData } from '@components/form/poll/poll.schema'
import { toast } from 'react-toastify'
import { usePoll } from '@/hooks/usePoll'
import { useAccount } from 'wagmi'
import { PrimaryButton } from '@components/buttons'
import type { Item } from '@/types/contract/ForumInterface' // Assuming the components are exported from this file

export default function PollCreateForm({ post, group, mutate, handleClose }) {
  const methods = useForm<PollCreationType>({
    resolver: zodResolver(PollCreationSchema),
    defaultValues: {
      title: 'Awesome Poll',
      content: 'Do you Like this poll?',
      pollType: 0,
      options: ['Yes', 'No'], // Default for two options
      duration: 1,
      numericRating: { rateScaleFrom: '0', rateScaleTo: '5' },
    },
  })
  const { address } = useAccount()

  const { createPoll } = usePoll({ group })

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
    handleClose()

    try {
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

      await createPoll({
        post: post ? post : undefined,
        pollType: data.pollType,
        duration: data.duration,
        answers: data.options,
        rateScaleFrom: data.numericRating?.rateScaleFrom,
        rateScaleTo: data.numericRating?.rateScaleTo,
        content: {
          title: data.title,
          description: transformStringToOutputData(data.content),
        },
        onSuccessCallback: () => {
          mutate && mutate()
        },
        onErrorCallback: err => {
          //rollback
          mutate((data: { posts: Item[]; comments: Item[] }) => {
            if (data.posts) {
              return {
                ...data,
                posts: data?.posts.filter(post => post.id !== optimisticPost.id),
              }
            } else {
              return {
                ...data,
                comments: data?.comments.filter(post => post.id !== optimisticPost.id),
              }
            }
          }, false)
          console.error(err)
          if (err instanceof Error) {
            toast.error(err?.message ?? 'An error occurred while creating the poll')
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
  const pollType = methods.watch('pollType')

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col space-y-4">
        <PollTitleInput form={methods} />
        <PollContentTextarea form={methods} />
        <PollTypeSelect form={methods} />
        <PollOptionsInput form={methods} />
        <PollDurationInput form={methods} />
        {Number(pollType) === 2 && <PollNumericRatingInput form={methods} />}
        <PrimaryButton type="submit" isLoading={methods.formState.isSubmitting}>
          Create
        </PrimaryButton>
      </form>
    </FormProvider>
  )
}
