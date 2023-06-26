import { OutputData } from '@editorjs/editorjs'
import { BigNumberish } from 'ethers'

export interface Requirement {
  name?: string
  symbol?: string
  tokenAddress?: string
  minAmount?: string
  decimals?: number
}

export interface Community {
  groupId: number
  id: number
  name: string
  userCount: number
  requirements: Requirement[]
  banner?: string
  logo?: string
  note?: string
  chainId?: number
  removed?: boolean
}

export interface CommunityDetails {
  description: string;
  tags: string[];
  bannerCID: string;
  logoCID: string;
}
export interface User {
  name: string
  identityCommitment: string
  id: number | string
  groupId: number
}

export interface Post {
  parentId: number
  id: number
  contentCID: string
  downvote: number
  upvote: number
  kind: 0 | 1
  groupId: number
  createdAt: number
}

export interface PostContent {
  title: string
  description: OutputData
}

export type ReputationProofStruct = {
  publicSignals: BigNumberish[]
  proof: BigNumberish[]
  publicSignalsQ: BigNumberish[]
  proofQ: BigNumberish[]
  ownerEpoch: BigNumberish
  ownerEpochKey: BigNumberish
}
