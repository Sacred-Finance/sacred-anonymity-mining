import { createComment, createPost, votePoll } from '@/lib/api'
import { GroupPostAPI, GroupPostCommentAPI } from '@/lib/fetcher'
import type { ItemCreationRequest, NewPostContent, PollRequestStruct } from '@/lib/model'

import {
  createNote,
  fetchUsersFromSemaphoreContract,
  getBytes32FromIpfsHash,
  hashBytes,
  hashBytes2,
  uploadIPFS,
} from '@/lib/utils'
import type { Group, Item } from '@/types/contract/ForumInterface'
import type { BigNumberish } from '@semaphore-protocol/group'
import { Group as SemaphoreGroup } from '@semaphore-protocol/group'
import { Identity } from '@semaphore-protocol/identity'
import { generateProof } from '@semaphore-protocol/proof'
import { mutate } from 'swr'
import { useAccount } from 'wagmi'

interface Poll {
  content: NewPostContent
  pollType: number
  duration: number
  answers: string[]
  rateScaleFrom: number
  rateScaleTo: number
  post?: Item // if post is undefined, it means it's a post, otherwise it's a comment
  onSuccessCallback: () => void
  onErrorCallback: (
    err:
      | string
      | {
          message: string
        }
  ) => void
}

interface SubmitPollParams {
  id: BigNumberish
  pollData: number[]
  onSuccessCallback?: (
    data:
      | {
          message: string
        }
      | undefined
  ) => void
  onErrorCallback?: (
    err:
      | string
      | {
          message: string
        }
  ) => void
}

export const usePoll = ({ group }: { group: Group }) => {
  const { address } = useAccount()

  const createPoll = async ({
    content,
    pollType,
    duration,
    answers,
    rateScaleFrom,
    rateScaleTo,
    post,
    onSuccessCallback,
    onErrorCallback,
  }: Poll): Promise<{
    message: string
  } | void> => {
    try {
      const currentDate = new Date()
      const _message = currentDate.getTime() + '#' + JSON.stringify(content)

      const cid = await uploadIPFS(_message)
      if (!cid) {
        throw 'Upload to IPFS failed'
      }

      const signal = getBytes32FromIpfsHash(cid)
      const extraNullifier = hashBytes(signal).toString()
      const users = await fetchUsersFromSemaphoreContract(group.groupId)
      const semaphoreGroup = new SemaphoreGroup(group.id, 20, users?.map(u => BigInt(u)) ?? [])

      const userIdentity = new Identity(address)

      const note = await createNote(userIdentity)

      const answerCIDs = []
      for (let i = 0; i < answers.length; i++) {
        const cid = await uploadIPFS(answers[i])
        if (!cid) {
          throw 'Upload to IPFS failed'
        }
        const answerCID = getBytes32FromIpfsHash(cid)
        answerCIDs.push(answerCID)
      }

      const fullProof = await generateProof(userIdentity, semaphoreGroup, extraNullifier, hashBytes(signal))
      const request: ItemCreationRequest = {
        contentCID: signal,
        merkleTreeRoot: fullProof.merkleTreeRoot.toString(),
        nullifierHash: fullProof.nullifierHash.toString(),
        note: note.toString(),
      }

      const pollRequest: PollRequestStruct = {
        pollType,
        duration,
        answerCount: answers.length,
        rateScaleFrom,
        rateScaleTo,
        answerCIDs,
      }
      const tempCache = {
        id: 'temp',
        content: content,
      }

      const { status } =
        post !== undefined
          ? await createComment({
              groupId: group.id.toString(),
              parentId: post.id.toString(),
              request: request,
              solidityProof: fullProof.proof,
              asPoll: true,
              pollRequest: pollRequest,
            })
          : await createPost({
              groupId: group.id.toString(),
              request: request,
              solidityProof: fullProof.proof,
              asPoll: true,
              pollRequest: pollRequest,
            })

      if (status === 200) {
        console.log(`A post posted by user ${address}`)
        if (post !== undefined) {
          await mutate(GroupPostCommentAPI(group.id.toString(), post.id.toString()), undefined, {
            optimisticData: data => {
              console.log('optimisticData', data)
              if (data) {
                return {
                  ...data,
                  posts: [...data.posts, tempCache],
                }
              }
            },
          })
        } else {
          await mutate(GroupPostAPI(group.id.toString()))
        }
        onSuccessCallback()
      } else {
        onErrorCallback('Creating a post failed!')
        throw new Error('Creating a post failed!')
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        onErrorCallback(error ?? 'Creating a post failed!')
      }
      console.error(error)
    }
  }

  const submitPoll = async ({ id, pollData, onSuccessCallback, onErrorCallback }: SubmitPollParams) => {
    try {
      const signal = hashBytes2(id, 'votePoll')
      const extraNullifier = signal.toString()
      const semaphoreGroup = new SemaphoreGroup(group.id)
      const users = await fetchUsersFromSemaphoreContract(group.id)
      users.forEach(u => semaphoreGroup.addMember(BigInt(u)))
      const userIdentity = new Identity(address)

      const fullProof = await generateProof(userIdentity, semaphoreGroup, extraNullifier, signal)
      const { status, data } = await votePoll(
        id.toString(),
        group.id.toString(),
        pollData,
        fullProof.merkleTreeRoot,
        fullProof.nullifierHash,
        fullProof.proof
      )
      if (status === 200) {
        if (onSuccessCallback) {
          onSuccessCallback(data)
        }
      } else {
        if (onErrorCallback) {
          onErrorCallback('Voting Poll failed!')
        }
      }
    } catch (error) {
      console.error(error)
      if (onErrorCallback && error instanceof Error) {
        onErrorCallback(error)
      }
    }
  }

  return { createPoll, submitPoll }
}
