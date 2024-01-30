import React, { useState } from 'react'
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
import { getRandomPoll } from '@components/form/poll/randomPolls' // Assuming the components are exported from this file
import type { Group, Item } from '@/types/contract/ForumInterface'
import { Dice3 } from 'lucide-react'
import { Button } from '@/shad/ui/button'
import type { KeyedMutator } from 'swr'
import type { GroupWithPostDataResponse } from '@pages/api/groupWithPostData'
import type { GroupWithPostAndCommentDataResponse } from '@pages/api/groupWithPostAndCommentData'

type MutateType<T> = T extends undefined
  ? KeyedMutator<GroupWithPostDataResponse>
  : KeyedMutator<GroupWithPostAndCommentDataResponse>

type PostCreateFormProps<T = undefined> = {
  post?: T
  group: Group
  mutate: MutateType<T>
}

export default function PollCreateForm({
  post,
  group,
  mutate,
  handleClose,
}: PostCreateFormProps<Item | undefined> & { handleClose: () => void }) {
  const [randomPoll, setRandomPoll] = useState(getRandomPoll())
  const methods = useForm<PollCreationType>({
    resolver: zodResolver(PollCreationSchema),
    defaultValues: {
      title: randomPoll.title,
      description: randomPoll.description,
      pollType: 0,
      options: randomPoll.options, // Default for two options
      duration: 1,
      numericRating: { rateScaleFrom: '0', rateScaleTo: '5' },
    },
  })
  const getNewRandomPoll = () => {
    setRandomPoll(getRandomPoll())
    methods.setValue('title', randomPoll.title)
    methods.setValue('description', randomPoll.description)
    methods.setValue('options', randomPoll.options)
  }

  const { address } = useAccount()

  const { createPoll } = usePoll({ group })

  const onSubmit = async (data: PollCreationType) => {
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

    try {
      mutate((data: { posts?: Item[]; comments?: Item[] }) => {
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
        rateScaleFrom: Number(data.numericRating?.rateScaleFrom),
        rateScaleTo: Number(data.numericRating?.rateScaleTo),
        content: {
          title: data.title,
          description: transformStringToOutputData(data.description),
        },
        onSuccessCallback: () => {
          mutate && mutate()
        },
        onErrorCallback: err => {
          //rollback
          mutate((data: { posts?: Item[]; comments?: Item[] }) => {
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
      <form onSubmit={methods.handleSubmit(onSubmit)} className="mx-2 flex h-full  flex-col space-y-4 ">
        <span className="mb-10 text-4xl">Create a new poll</span>

        <div className="flex w-full">
          <PollTitleInput
            form={methods}
            title={
              <div className="flex items-center gap-2">
                <Button size="icon" type="button" variant="ghost" onClick={getNewRandomPoll}>
                  <Dice3 size={24} />
                </Button>
                Title
                <Button
                  className="ml-auto px-10 tracking-widest"
                  size="icon"
                  type="button"
                  variant="outline"
                  onClick={() => {
                    methods.setValue('title', '')
                    methods.setValue('description', '')
                    methods.setValue('options', [])
                  }}
                >
                  RESET
                </Button>
              </div>
            }
          />
        </div>
        <PollContentTextarea form={methods} />
        <PollTypeSelect form={methods} />
        <PollOptionsInput form={methods} />
        <PollDurationInput form={methods} />
        {Number(pollType) === 2 && <PollNumericRatingInput form={methods} />}
        <div className=" flex-1 grow " />
        <PrimaryButton type="submit" isLoading={methods.formState.isSubmitting}>
          Create
        </PrimaryButton>
      </form>
    </FormProvider>
  )
}
