import type { OutputData } from '@editorjs/editorjs'
import type { BigNumberish } from 'ethers'
import type { Requirement as ContractRequirement } from '@/types/contract/ForumInterface'
import type { Identity } from '@semaphore-protocol/identity'

export interface Requirement extends ContractRequirement {
  name?: string
  symbol?: string
  decimals?: number
}

export interface CommunityDetails {
  description: string
  tags: string[]
  bannerCID: string
  logoCID: string
}

export interface User {
  name: string
  identityCommitment: Identity['_commitment']
  id: number | string
  groupId: BigNumberish
}

export enum ContentType {
  POST = 0,
  COMMENT = 1,
  'POLL' = 2,
}

export interface PostOrComment {
  parentId: number
  id: number
  contentCID: string
  downvote: number
  upvote: number
  kind: ContentType
  groupId: number
  createdAt: number
}

export interface PostContent extends PostOrComment {
  title?: string
  description: typeof OutputData
}

export type NewPostContent = Pick<PostContent, 'title' | 'description'>

export type PollRequestStruct = {
  pollType: BigNumberish
  duration: BigNumberish //hours
  answerCount: BigNumberish
  rateScaleFrom?: BigNumberish
  rateScaleTo?: BigNumberish
  answerCIDs: string[]
}

export type ItemCreationRequest = {
  contentCID: string
  merkleTreeRoot: BigNumberish
  nullifierHash: BigNumberish
  note: BigNumberish
}

export enum PollType {
  'SINGLE_ANSWER', //User can select only one answer in the answer list.
  'MULTI_ANSWER', //User can select multiple answers in the answer list.
  'NUMERIC_RATING', //User can specify values per anwser, the value must be in the range(rateScaleFrom~rateScaleTo)
}

export type DiscourseCommunity = {
  apiKey?: string
  username?: string
  endpoint?: string
  id?: number
  readonly?: boolean
}
