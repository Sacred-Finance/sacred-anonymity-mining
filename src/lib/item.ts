import { ItemCreationRequest, ReputationProofStruct, User } from '@/lib/model'
import { BigNumber, ethers } from 'ethers'
import { Identity } from '@semaphore-protocol/identity'
import { createNote, generateGroth16Proof, getBytes32FromIpfsHash, hashBytes, uploadIPFS } from '@/lib/utils'
import { forumContract } from '@/constant/const'
import { createComment, createPost, edit } from '@/lib/api'
import { UnirepUser } from '@/lib/unirep'
import { MIN_REP_POST } from '@/lib/post'
import { MIN_REP_COMMENT } from '@/lib/comment'
import { generateProof } from '@semaphore-protocol/proof'
import { Group as SemaphoreGroup, Group } from '@semaphore-protocol/group'
import { mutate } from 'swr'
import { getGroupWithPostAndCommentData, getGroupWithPostData } from '@/lib/fetcher'

export const emptyPollRequest = {
  pollType: 0,
  duration: 0,
  answerCount: 0,
  rateScaleFrom: 0,
  rateScaleTo: 0,
  answerCIDs: [],
}

export async function handleDeleteItem(address: string, postedByUser: User, itemId) {
  try {
    let signal = ethers.constants.HashZero
    const userPosting = new Identity(`${address}_${this.groupId}_${postedByUser?.name}`)
    const note = await createNote(userPosting)

    const item = await forumContract.itemAt(itemId)
    let input = {
      note: BigInt(item.note.toHexString()),
      trapdoor: userPosting.getTrapdoor(),
      nullifier: userPosting.getNullifier(),
    }

    const { a, b, c } = await generateGroth16Proof(
      input,
      '/circuits/VerifyOwner__prod.wasm',
      '/circuits/VerifyOwner__prod.0.zkey'
    )
    return edit(itemId, signal, note, a, b, c).then(async data => {
      if (this.postId) {
        await mutate(getGroupWithPostAndCommentData(this.groupId, this.postId))
      } else {
        await mutate(getGroupWithPostData(this.groupId))
      }
      return data
    })
  } catch (error) {
    throw error
  }
}

// todo: create works, but it fails in either the caching, or updating the UI after its made - fix currently is refreshing the page.
export async function create(content, type, address, users, postedByUser, groupId, setWaiting, onIPFSUploadSuccess) {
  let currentDate = new Date()
  const message = currentDate.getTime().toString() + '#' + JSON.stringify(content)

  try {
    const cid = await uploadIPFS(message)
    if (!cid) {
      throw Error('Upload to IPFS failed')
    }
    onIPFSUploadSuccess(content, cid)

    const signal = getBytes32FromIpfsHash(cid)
    const userPosting = new Identity(`${address}_${this.groupId}_${postedByUser?.name || 'anon'}`)
    const unirepUser = new UnirepUser(userPosting)
    await unirepUser.updateUserState()
    const userState = await unirepUser.getUserState()

    let reputationProof = await userState.genProveReputationProof({
      epkNonce: 0,
      minRep: 0,
      graffitiPreImage: 0,
    })

    const extraNullifier = hashBytes(signal).toString()
    const note = await createNote(userPosting)
    const u = users.filter(u => u?.groupId === +groupId)
    const g = new SemaphoreGroup(groupId)
    u.forEach(u => g.addMember(BigInt(u)))

    const { proof, merkleTreeRoot, nullifierHash } = await generateProof(
      userPosting,
      g,
      extraNullifier,
      hashBytes(signal)
    )

    const epochData = unirepUser.getEpochData()

    const epoch: ReputationProofStruct = {
      publicSignals: epochData.publicSignals,
      proof: epochData.proof,
      publicSignalsQ: reputationProof.publicSignals,
      proofQ: reputationProof.proof,
      ownerEpoch: BigNumber.from(epochData.epoch)?.toString(),
      ownerEpochKey: epochData.epochKey,
    }

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
        unirepProof: epoch,
        asPoll: false,
        pollRequest: emptyPollRequest,
      }).then(async res => {
        await mutate(getGroupWithPostData(this.groupId))
        return res
      })
    } else if (type === 'comment') {
      console.log('creating comment')
      return await createComment({
        groupId: this.groupId,
        parentId: this.postId,
        request: request,
        solidityProof: proof,
        unirepProof: epoch,
        asPoll: false,
        pollRequest: emptyPollRequest,
      }).then(async res => {
        await mutate(getGroupWithPostAndCommentData(this.groupId, this.postId))
        return res
      })
    }
  } catch (error) {
    console.log('error in creating', type, error)
    throw error
  }
}

export async function editContent(type, content, address: string, itemId, postedByUser: User) {
  let currentDate = new Date()
  const message = currentDate.getTime().toString() + '#' + JSON.stringify(content)
  console.log(`Editing your anonymous ${type}...`)
  let cid
  try {
    cid = await uploadIPFS(message)
    if (!cid) {
      throw Error('Upload to IPFS failed')
    }
    const signal = getBytes32FromIpfsHash(cid)

    const userPosting = new Identity(`${address}_${this.groupId}_${postedByUser?.name}`)
    const note = await createNote(userPosting)

    const item = await forumContract.itemAt(itemId)

    let input = {
      trapdoor: userPosting.getTrapdoor(),
      note: BigInt(item.note.toHexString()),
      nullifier: userPosting.getNullifier(),
    }

    const { a, b, c } = await generateGroth16Proof(
      input,
      '/circuits/VerifyOwner__prod.wasm',
      '/circuits/VerifyOwner__prod.0.zkey'
    )

    return await edit(itemId, signal, note, a, b, c)
      .then(async data => {
        console.log('edited item!', data, this.groupId, itemId)
        await mutate(getGroupWithPostAndCommentData(this.groupId, this.postId ?? itemId))
        return data
      })
      .catch(err => {
        console.log('error', err)
      })
  } catch (error) {
    throw error
  }
}

export async function updateContentVote(itemId, voteType, confirmed: boolean, type, revert = false) {
  if (type === 'post') {
    await mutate(getGroupWithPostData(this.groupId))
  } else if (type === 'comment') {
    await mutate(getGroupWithPostAndCommentData(this.groupId, this.postId))
  }
}
