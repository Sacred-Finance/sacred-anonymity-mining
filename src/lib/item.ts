import type { ItemCreationRequest, User } from '@/lib/model'
import { ethers } from 'ethers'
import { Identity } from '@semaphore-protocol/identity'
import {
  createNote,
  fetchUsersFromSemaphoreContract,
  generateGroth16Proof,
  getBytes32FromIpfsHash,
  hashBytes,
  uploadIPFS,
} from '@/lib/utils'
import { forumContract } from '@/constant/const'
import { createComment, createPost, edit } from '@/lib/api'
import type { BigNumberish } from '@semaphore-protocol/group'
import { Group as SemaphoreGroup } from '@semaphore-protocol/group'
import { mutate } from 'swr'
import { GroupPostAPI, GroupPostCommentAPI } from '@/lib/fetcher'
import { generateProof } from '@semaphore-protocol/proof'
import type { GroupId } from '@/types/contract/ForumInterface'
import type { Address } from 'wagmi'

export const emptyPollRequest = {
  pollType: 0,
  duration: 0,
  answerCount: 0,
  rateScaleFrom: 0,
  rateScaleTo: 0,
  answerCIDs: [],
}

export async function handleDeleteItem(
  this: {
    groupId: BigNumberish
    postId: BigNumberish
  },
  address: Address,
  postedByUser: User,
  itemId: bigint
) {
  const signal = ethers.constants.HashZero
  const userPosting = new Identity(address)

  const note = await createNote(userPosting)

  const item = await forumContract.read.itemAt([itemId])
  const input = {
    note: item.note,
    trapdoor: userPosting.getTrapdoor(),
    nullifier: userPosting.getNullifier(),
  }

  const { a, b, c } = await generateGroth16Proof({ input: input })

  return edit(itemId.toString(), signal, note, a, b, c).then(async data => {
    if (this.postId) {
      await mutate(GroupPostCommentAPI(this.groupId, this.postId))
    } else {
      await mutate(GroupPostAPI(this.groupId))
    }
    return data
  })
}

// todo: create works, but it fails in either the caching, or updating the UI after its made - fix currently is refreshing the page.
export async function create(
  this: {
    groupId: BigNumberish
    postId: BigNumberish
  },
  content: any,
  type: string,
  address: string | undefined,
  users: any,
  postedByUser: any,
  groupId: BigNumberish | GroupId,
  setWaiting: any,
  onIPFSUploadSuccess: (arg0: any, arg1: string) => void
) {
  const currentDate = new Date()
  const message = currentDate.getTime().toString() + '#' + JSON.stringify(content)

  try {
    const cid = await uploadIPFS(message)
    if (!cid) {
      throw Error('Upload to IPFS failed')
    }
    onIPFSUploadSuccess(content, cid)

    const signal = getBytes32FromIpfsHash(cid)
    const userPosting = new Identity(address)

    const extraNullifier = hashBytes(signal).toString()
    const note = await createNote(userPosting)
    const semaphoreGroup = new SemaphoreGroup(groupId)
    const u = await fetchUsersFromSemaphoreContract(groupId)
    u.forEach(u => semaphoreGroup.addMember(BigInt(u)))

    const { proof, merkleTreeRoot, nullifierHash } = await generateProof(
      userPosting,
      semaphoreGroup,
      extraNullifier,
      hashBytes(signal)
    )

    const request: ItemCreationRequest = {
      contentCID: signal,
      merkleTreeRoot: merkleTreeRoot.toString(),
      nullifierHash: nullifierHash.toString(),
      note: note.toString(),
    }

    if (type === 'post') {
      return await createPost({
        groupId: this.groupId,
        request: request,
        solidityProof: proof,
        asPoll: false,
        pollRequest: emptyPollRequest,
      }).then(async res => {
        return res
      })
    } else if (type === 'comment') {
      return await createComment({
        groupId: this.groupId,
        parentId: this.postId,
        request: request,
        solidityProof: proof,
        asPoll: false,
        pollRequest: emptyPollRequest,
      }).then(async res => {
        return res
      })
    }
  } catch (error) {
    console.log('error in creating', type, error)
    throw error
  }
}

export async function editContent(
  this: {
    groupId: string
    postId: string
  },
  type: 'post' | 'comment',
  content: string,
  address: string,
  itemId: number,
  postedByUser: User
) {
  const currentDate = new Date()
  const message = currentDate.getTime().toString() + '#' + JSON.stringify(content)
  console.log(`Editing your anonymous ${type}...`)
  const cid = await uploadIPFS(message)
  if (!cid) {
    throw Error('Upload to IPFS failed')
  }
  const signal = getBytes32FromIpfsHash(cid)

  const userPosting = new Identity(address)
  const note = await createNote(userPosting)

  const item = await forumContract.read.itemAt([BigInt(itemId)])

  const input = {
    trapdoor: userPosting.getTrapdoor(),
    note: item.note,
    nullifier: userPosting.getNullifier(),
  }
  const { a, b, c } = await generateGroth16Proof({ input: input })

  return await edit(itemId.toString(), signal, note, a, b, c)
}
