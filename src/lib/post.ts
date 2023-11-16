import { Group } from '@semaphore-protocol/group'
import { Identity } from '@semaphore-protocol/identity'
import { generateProof } from '@semaphore-protocol/proof'
import { BigNumber, utils } from 'ethers'
import { vote } from './api'
import { PostContent, ReputationProofStruct, User } from './model'
import { getContent, getIpfsHashFromBytes32, hashBytes2 } from './utils'
import { getCache, removeAt, setCache } from '../lib/redis'
import { mutate } from 'swr'
import { UnirepUser } from './unirep'
import { forumContract, jsonRPCProvider } from '@/constant/const'
import { create, editContent, handleDeleteItem, updateContentVote } from '@/lib/item'
import { Address } from '@/types/common'

export const MIN_REP_POST = 0

export const MIN_REP_VOTE = 1

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

  // why are we using _post and not _group
  postCacheId() {
    return this.id + '_post'
  }
  cacheId() {
    return this.id + '_post'
  }

  groupCacheId() {
    return this.groupId + '_group'
  }

  specificPostId(postId?) {
    return `${this.groupId}_post_${this.id ?? postId}`
  }

  specificId(postId?) {
    return `${this.groupId}_post_${this.id ?? postId}`
  }

  async create({ postContent, address, users, postedByUser, groupId, setWaiting, onIPFSUploadSuccess }: CreatePost) {
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
    return await editContent.call(this, 'post', postContent, address, itemId, postedByUser, groupId, setWaiting)
  }

  async delete(address: string, itemId, users: User[], postedByUser: User, groupId: string, setWaiting: Function) {
    console.log(`Removing your anonymous post...`)
    return await handleDeleteItem.call(this, address, postedByUser, itemId)
  }

  // these previously accepted an instance
  async updatePostsVote(itemId, voteType, confirmed: boolean, revert = false) {
    updateContentVote.call(this, itemId, voteType, confirmed, 'post', revert)
  }

  async vote(voteType, address, users, postedByUser, itemId, groupId) {
    try {
      // Validate parameters
      if (!address) throw new Error('Invalid address')
      if (!Array.isArray(users)) throw new Error('Invalid users array')
      if (isNaN(itemId)) throw new Error('Invalid item ID')
      if (isNaN(groupId)) throw new Error('Invalid group ID')

      const voteCmdNum = hashBytes2(+itemId, 'vote')
      const signal = utils.hexZeroPad('0x' + voteCmdNum.toString(16), 32)
      const extraNullifier = voteCmdNum.toString()
      const g = new Group(groupId)
      const userPosting = new Identity(`${address}`)

      const filteredUsers = users.filter(u => u?.groupId === +this.groupId)
      if (filteredUsers.length === 0) throw new Error('No matching users found for the provided groupId')

      g.addMembers(filteredUsers.map(u => u?.identityCommitment))

      const unirepUser = new UnirepUser(userPosting)
      await unirepUser.updateUserState()
      const userState = await unirepUser.getUserState()
      // if (!userState) throw new Error("Failed to get User State");

      let reputationProof = await userState.genProveReputationProof({
        epkNonce: 0,
        minRep: MIN_REP_VOTE,
        graffitiPreImage: '',
      })

      const epochData = unirepUser.getEpochData()
      if (!epochData) throw new Error('Failed to get Epoch Data')

      let voteProofData: ReputationProofStruct = {
        publicSignals: epochData.publicSignals,
        proof: epochData.proof,
        publicSignalsQ: reputationProof.publicSignals,
        proofQ: reputationProof.proof,
        ownerEpoch: 0,
        ownerEpochKey: 0,
      }

      // time this
      const { proof, nullifierHash, merkleTreeRoot } = await generateProof(userPosting, g, extraNullifier, signal)
      return vote(
        itemId,
        this.groupId?.toString(),
        voteType,
        merkleTreeRoot.toString(),
        nullifierHash.toString(),
        proof,
        voteProofData
      )
    } catch (error) {
      console.error('An error occurred while voting:', error)
      return error
    }
  }

  removeFromCache = async postId => {
    mutate(
      this.groupCacheId(),
      async posts => {
        const postsCopy = [...posts]
        if (postsCopy?.length) {
          const i = posts.findIndex(p => +p.id == postId)
          if (i > -1) {
            postsCopy.splice(i, 1)
          }
          await removeAt(this.specificId(postId), '$')
        }
        return postsCopy
      },
      { revalidate: false }
    )
  }
}
