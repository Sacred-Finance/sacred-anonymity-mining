import { Group } from '@semaphore-protocol/group'
import { Identity } from '@semaphore-protocol/identity'
import { generateProof } from '@semaphore-protocol/proof'
import { utils } from 'ethers'
import { vote } from './api'
import type { PostContent, User } from './model'
import { hashBytes2 } from './utils'
import { jsonRPCProvider } from '@/constant/const'
import { create, editContent, handleDeleteItem } from '@/lib/item'
import type { Address } from '@/types/common'

interface CreatePost {
  postContent: Partial<PostContent>
  address: Address
  users: User[]
  postedByUser: User
  groupId: string
  setWaiting: Function
  onIPFSUploadSuccess: (post, cid) => void
}

export class Post {
  id: string | undefined
  groupId: string
  provider = jsonRPCProvider

  constructor(id: string | undefined, groupId) {
    this.id = id
    this.groupId = groupId
  }

  specificId(postId?) {
    return `${this.groupId}_post_${this.id ?? postId}`
  }

  async create({
    postContent,
    address,
    users,
    postedByUser,
    groupId,
    setWaiting,
    onIPFSUploadSuccess,
  }: CreatePost) {
    return await create.call(
      this,
      postContent,
      'post',
      address,
      users,
      postedByUser,
      groupId,
      setWaiting,
      onIPFSUploadSuccess
    )
  }

  async edit(
    postContent: PostContent,
    address: Address,
    itemId,
    postedByUser: User,
    groupId: string,
    setWaiting: Function
  ) {
    return await editContent.call(
      this,
      'post',
      postContent,
      address,
      itemId,
      postedByUser,
      groupId,
      setWaiting
    )
  }

  async delete(
    address: string,
    itemId,
    users: User[],
    postedByUser: User,
    groupId: string,
    setWaiting: Function
  ) {
    return await handleDeleteItem.call(this, address, postedByUser, itemId)
  }

  async vote(voteType, address, users, postedByUser, itemId, groupId) {
    try {
      // Validate parameters
      if (!address) {
        throw new Error('Invalid address')
      }
      if (!Array.isArray(users)) {
        throw new Error('Invalid users array')
      }
      if (isNaN(itemId)) {
        throw new Error('Invalid item ID')
      }
      if (isNaN(groupId)) {
        throw new Error('Invalid group ID')
      }

      const voteCmdNum = hashBytes2(+itemId, 'vote')
      const signal = utils.hexZeroPad('0x' + voteCmdNum.toString(16), 32)
      const extraNullifier = voteCmdNum.toString()
      const g = new Group(groupId)
      const userPosting = new Identity(`${address}`)

      const filteredUsers = users.filter(u => u?.groupId === +this.groupId)
      if (filteredUsers.length === 0) {
        throw new Error('No matching users found for the provided groupId')
      }

      g.addMembers(filteredUsers.map(u => u?.identityCommitment))

      // time this
      const { proof, nullifierHash, merkleTreeRoot } = await generateProof(
        userPosting,
        g,
        extraNullifier,
        signal
      )
      return vote(
        itemId,
        this.groupId?.toString(),
        voteType,
        merkleTreeRoot.toString(),
        nullifierHash.toString(),
        proof
      )
    } catch (error) {
      console.error('An error occurred while voting:', error)
      return error
    }
  }
}
