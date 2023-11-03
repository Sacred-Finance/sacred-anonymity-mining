import { BigNumber, ethers } from 'ethers'
import {OutputData} from "@editorjs/editorjs";
import {OutputBlockData} from "@editorjs/editorjs/types/data-formats/output-data";
import { PartialBlock } from '@blocknote/core';

export interface Admins {
  _admins: string[]
}

export interface Moderators {
  _moderators: string[]
}

export interface Index {
  index: number
}

export interface addressItem {
  // named item in the contract
  address: string // named item in the contract
}

export interface GroupId {
  groupId: number
}

export interface ItemId {
  itemId: number
}

export interface AddAdmins {
  (args: Admins): void
}

export interface AddModerators {
  (args: Moderators): void
}

export interface AdminAt {
  (args: Index): string
}

export interface AdminCount {
  (): number
}

export interface GetAdmins {
  (): string[]
}

export interface GetModerators {
  (): string[]
}

export interface IsAdmin {
  (args: addressItem): boolean
}

export interface IsGroupRemoved {
  (args: GroupId): boolean
}

export interface IsItemRemoved {
  (args: ItemId): boolean
}

export interface IsModerator {
  (args: addressItem): boolean
}

export interface ModeratorAt {
  (args: Index): string
}

export interface ModeratorCount {
  (): number
}

export interface Address {
  _admin: string
}

export interface GroupId {
  groupId: number
}

export interface ItemId {
  itemId: number
}

export interface Moderators {
  _moderators: string[]
}

export interface GroupIdBannerCID {
  groupId: number
  bannerCID: string
}

export interface GroupIdDescription {
  groupId: number
  description: string
}

export interface GroupDetails {
  description: string
  tags: string[]
  bannerCID: string
  logoCID: string
}

export interface GroupIdDetails {
  groupId: number
  details: GroupDetails
}

export interface GroupIdLogoCID {
  groupId: number
  logoCID: string
}

export interface GroupIdTags {
  groupId: number
  tags: string[]
}

export interface RemoveAdmin {
  (args: Address): void
}

export interface RemoveGroup {
  (args: GroupId): void
}

export interface RemoveItem {
  (args: ItemId): void
}

export interface RemoveModerators {
  (args: Moderators): void
}

export interface RevokeMyAdminRole {
  (): void
}

export interface SetGroupBanner {
  (args: GroupIdBannerCID): void
}

export interface SetGroupDescription {
  (args: GroupIdDescription): void
}

export interface SetGroupDetails {
  (args: GroupIdDetails): void
}

export interface SetGroupLogo {
  (args: GroupIdLogoCID): void
}

export interface SetGroupTags {
  (args: GroupIdTags): void
}

export interface ReputationRequirement {
  post: number
  comment: number
  upvote: number
  downvote: number
}

export interface ReputationWeight {
  post: number
  comment: number
  upvote: number
  downvote: number
  reply: number
  upvoted: number
  downvoted: number
}

export interface NewGroupCreated {
  groupId: number
  name: string
  note: number
}

export interface NewUser {
  groupId: number
  identityCommitment: number
  username: string
}

export interface Requirement {
  tokenAddress: string
  minAmount: string
  // maxAmount: string
  // The following are not part of the contract
  name?: string
  symbol?: string
  decimals?: number
}

export interface RawRequirement {
  tokenAddress: string
  minAmount: ethers.BigNumber,
  // maxAmount: ethers.BigNumber
}

export type RawGroupData = {
  id: ethers.BigNumber
  name: string
  groupDetails: {
    bannerCID: ethers.BigNumber
    logoCID: ethers.BigNumber
    description: ethers.BigNumber
    tags: ethers.BigNumber[]
  }
  requirements: RawRequirement[]
  note: ethers.BigNumber
  userCount: ethers.BigNumber
  chainId: ethers.BigNumber
  posts: ethers.BigNumber[]
  removed: boolean
}

export interface Group {
  name: string
  groupDetails: GroupDetails
  requirements: Requirement[]
  id: number
  note: string
  userCount: number
  ownerIdentity?: string
  chainId: number
  posts: Item[]
  removed: boolean
  // The following are not part of the contract
  groupId?: string
}

// Definitions for each function
export interface SetReputationRequirement {
  repRequirement: ReputationRequirement
}

export interface SetReputationWeight {
  repWeight: ReputationWeight
}

export interface AttesterSignUp {
  attester: string
  epochLength: number
}

export interface CreateGroup {
  groupName: string
  chainId: number
  requirements: Requirement[]
  details: GroupDetails
  note: number
}

export interface GetUserName {
  groupId: number
  identityCommitment: number
}

export interface GroupAt {
  index: number
}

export interface GroupCount {
  (): Promise<number> // It seems like groupCount is a function that returns a Promise of a number
}

export interface GroupDetailsFunc {
  (index: number): Promise<GroupDetails> // It takes an index (number) and returns a Promise of GroupDetails
}

export interface GroupRequirements {
  (groupId: number): Promise<Requirement[]> // It takes a groupId (number) and returns a Promise of Requirement array
}

export interface JoinGroup {
  (groupId: number, identityCommitment: number, username: string): Promise<void> // The function that doesn't return a value, hence Promise<void>
}

export interface PostsInGroup {
  (groupId: number): Promise<number[]> // This function takes groupId and returns a Promise of number array
}

export interface SetGroupBannerByOwner {
  (a: number[], b: number[][], c: number[], groupId: number, bannerCID: string): Promise<void> // The function that doesn't return a value, hence Promise<void>
}

export interface SetGroupDescriptionByOwner {
  (a: number[], b: number[][], c: number[], groupId: number, description: string): Promise<void> // The function that doesn't return a value, hence Promise<void>
}

export interface SetGroupDetailsByOwner {
  (a: number[], b: number[][], c: number[], groupId: number, details: GroupDetails): Promise<void> // The function that doesn't return a value, hence Promise<void>
}

export interface SetGroupLogoByOwner {
  (a: number[], b: number[][], c: number[], groupId: number, logoCID: string): Promise<void> // The function that doesn't return a value, hence Promise<void>
}

export interface SetGroupTagsByOwner {
  (a: number[], b: number[][], c: number[], groupId: number, tags: string[]): Promise<void> // The function that doesn't return a value, hence Promise<void>
}

export interface UserUnirepSignUp {
  (attester: string, publicSignals: number[], proof: number[]): Promise<void> // The function that doesn't return a value, hence Promise<void>
}

// Events
export interface NewItem {
  itemType: number // enum ItemKind mapped to number (uint8)
  groupId: number // uint256
  id: number // uint256
  parentId: number // uint256
  contentCID: string // bytes32 mapped to string
  note: number // uint256
}

export interface UpdateItem {
  itemType: number // enum ItemKind mapped to number (uint8)
  itemId: number // uint256
  newCID: string // bytes32 mapped to string
}

export interface VoteItem {
  voteType: number // enum VoteKind mapped to number (uint8)
  itemType: number // enum ItemKind mapped to number (uint8)
  itemId: number // uint256
  upvote: number // uint256
  downvote: number // uint256
}

export interface AddComment {
  groupId: number // uint256
  parentId: number // uint256
  contentCID: string // bytes32 mapped to string
  merkleTreeRoot: number // uint256
  nullifierHash: number // uint256
  note: number // uint256
  semaphoreProof: number[] // uint256[8]
  unirepProof: ReputationProof // struct ReputationProof
}

export interface AddPost {
  groupId: number // uint256
  contentCID: string // bytes32 mapped to string
  merkleTreeRoot: number // uint256
  nullifierHash: number // uint256
  note: number // uint256
  semaphoreProof: number[] // uint256[8]
  unirepProof: ReputationProof // struct ReputationProof
}

export interface EditItem {
  _a: number[] // uint256[2]
  _b: number[][] // uint256[2][2]
  _c: number[] // uint256[2]
  itemId: number // uint256
  newCID: string // bytes32 mapped to string
}

export type ItemKind = number

export type RawItemData = {
  kind: BigNumber
  id: BigNumber
  parentId: BigNumber
  groupId: BigNumber
  createdAtBlock: BigNumber
  childIds: BigNumber[]
  upvote: BigNumber
  downvote: BigNumber
  note: BigNumber
  ownerEpoch: BigNumber
  ownerEpochKey: BigNumber
  contentCID: string
  removed: boolean
}

export type Item = {
  kind: ItemKind
  id: string
  parentId: string
  groupId: string
  createdAtBlock: number
  childIds: string[]
  upvote: number
  downvote: number
  note: string
  ownerEpoch: string
  ownerEpochKey: string
  contentCID: string
  removed: boolean
  // The following are not part of the contract
  createdAt: Date
  title?: string
  description?: PartialBlock[]
  // blocks?: OutputBlockData[] | undefined
}

export type ReputationProof = {
  publicSignals: number[]
  proof: number[]
  publicSignalsQ: number[]
  proofQ: number[]
  ownerEpoch: number
  ownerEpochKey: number
}

export type VoteKind = number

export interface GetCommentIdListFunction {
  (postId: number): Promise<number[]>
}

export interface GetPostIdListFunction {
  (groupId: number): Promise<number[]>
}

export interface ItemAtFunction {
  (index: number): Promise<Item>
}

export interface ItemCountFunction {
  (): Promise<number>
}

export interface VoteFunction {
  (
    groupId: number,
    itemId: number,
    voteType: VoteKind,
    merkleTreeRoot: number,
    nullifierHash: number,
    semaphoreProof: number[],
    unirepProof: ReputationProof
  ): Promise<void>
}
