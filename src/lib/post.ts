import { Group } from '@semaphore-protocol/group'
import { Identity } from '@semaphore-protocol/identity'
import { generateProof } from '@semaphore-protocol/proof'
import { BigNumber, Contract, ethers, providers, utils } from 'ethers'
import { createPost, edit, vote } from './api'
import { PostContent, ReputationProofStruct, User } from './model'
import {
  createNote,
  generateGroth16Proof,
  getBytes32FromIpfsHash,
  getContent,
  getIpfsHashFromBytes32,
  hashBytes,
  hashBytes2,
  parsePost,
  uploadIPFS,
} from './utils'
import { getCache, getMCache, removeAt, setCache, setCacheAtSpecificPath } from '../lib/redis'
import { mutate } from 'swr'
import { reverse } from 'lodash'
import { UnirepUser } from './unirep'
import { AxiosResponse } from 'axios'
import { forumContract, jsonRPCProvider } from '@/constant/const'

const MIN_REP_POST = 0

const MIN_REP_VOTE = 1

export interface PostInterface {
  id: string
  groupId: string
  cacheNewPost: (post, postId, groupId, note: BigInt, contentCID, setWaiting) => Promise<void>
  cacheUpdatedPost: (post, postId, groupId, contentCID, note, setWaiting) => Promise<void>
  removeFromCache: (postId) => Promise<void>

  postCacheId(): string

  groupCacheId(): string

  specificPostId(postId?): string

  getAll(): Promise<any>

  get(): Promise<any>

  create(
    postContent: PostContent,
    address: string,
    users: User[],
    postedByUser: User,
    groupId: string,
    setWaiting: Function,
    onIPFSUploadSuccess: (post, cid) => void
  ): Promise<AxiosResponse<any>>

  edit(
    postContent: PostContent,
    address: string,
    itemId,
    users: User[],
    postedByUser: User,
    groupId: string,
    setWaiting: Function
  ): Promise<AxiosResponse<any>>

  delete(
    address: string,
    itemId,
    users: User[],
    postedByUser: User,
    groupId: string,
    setWaiting: Function
  ): Promise<AxiosResponse<any>>

  updatePostsVote(postInstance, itemId, voteType, confirmed: boolean, revert?): Promise<void>

  updatePostVote(voteType, confirmed: boolean, revert): Promise<void>

  vote(voteType, address: string, users: User[], postedByUser: User, itemId, groupId): Promise<AxiosResponse<any>>
}

export class Post implements PostInterface {
  id: string
  groupId: string
  provider = jsonRPCProvider

  constructor(id: string, groupId) {
    this.id = id
    this.groupId = groupId
  }

  postCacheId() {
    return this.id + '_post'
  }

  groupCacheId() {
    return this.groupId + '_group'
  }

  specificPostId(postId?) {
    return `${this.groupId}_post_${this.id ?? postId}`
  }

  async getAll() {
    const getData = async () => {
      const itemIds = await forumContract.getPostIdList(+this.groupId)
      const rawPosts = await Promise.all(itemIds.map(i => forumContract.itemAt(i.toNumber())))
      let p = []
      for (const c of rawPosts) {
        if (!c?.removed && ethers.constants.HashZero !== c?.contentCID) {
          try {
            const ipfsHash = getIpfsHashFromBytes32(c?.contentCID)
            const content = await getContent(ipfsHash)
            const block = await jsonRPCProvider.getBlock(c.createdAtBlock.toNumber())
            let parsedContent
            try {
              parsedContent = JSON.parse(content)
            } catch (error) {
              parsedContent = content
            }
            const postData = {
              ...parsedContent,
              createdAt: new Date(block.timestamp * 1000),
              id: c.id.toString(),
              upvote: parseInt(c.upvote),
              downvote: parseInt(c.downvote),
              note: BigNumber.from(c?.note),
              contentCID: getIpfsHashFromBytes32(c?.contentCID),
            }
            p.push(postData)
            await setCache(this.specificPostId(parseInt(c?.id)), postData)
          } catch (error) {
            console.log(error)
          }
        }
      }
      p = p.sort((d1, d2) => (d2.createdAt < d1.createdAt ? 1 : -1))
      console.log({ p })
      return p
    }

    try {
      const itemIds = await forumContract.getPostIdList(+this.groupId)

      console.log('', { itemIds })
      if (!itemIds?.length) {
        return []
      }
      const mappedItemIds = itemIds.map(i => this.specificPostId(i.toNumber()))
      const { cache: mCache, refresh: mRefresh } = await getMCache(mappedItemIds)

      console.log(mCache)

      if (true) {
        return reverse(mCache?.map(c => (c ? c[0] : null)))
          .filter(a => a && !a?.removed)
          .map(c => c?.data)
      } else {
        return getData()
      }
    } catch (error) {
      console.error(error)
      return null
    }
  }

  async get() {
    const getData = async () => {
      const p = await forumContract.itemAt(this.id)
      const block = await jsonRPCProvider.getBlock(p.createdAtBlock.toNumber())
      const postText = await getContent(getIpfsHashFromBytes32(p?.contentCID))
      let parsedPost
      try {
        parsedPost = JSON.parse(postText)
      } catch (error) {
        parsedPost = {
          title: postText,
          description: '',
        }
      }

      const post = {
        ...parsedPost,
        id: typeof this.id === 'object' ? (this.id as BigNumber)?.toNumber() : this.id,
        upvote: parseInt(p?.upvote),
        downvote: parseInt(p?.downvote),
        note: BigNumber.from(p?.note),
        createdAt: new Date(block.timestamp * 1000),
        contentCID: getIpfsHashFromBytes32(p?.contentCID),
      }
      setCache(this.specificPostId(), post)
      return post
    }

    try {
      const { cache, refresh } = await getCache(this.specificPostId())

      if (true) {
        cache.createdAt = new Date(cache.createdAt)
        if (refresh) getData()
        return cache?.removed ? null : cache
      } else {
        return await getData()
      }
    } catch (error) {
      console.error(error)
      return null
    }
  }

  async create(
    postContent: PostContent,
    address: string,
    users: User[],
    postedByUser: User,
    groupId: string,
    setWaiting: Function,
    onIPFSUploadSuccess: (post, cid) => void
  ) {
    let currentDate = new Date()

    const p = {
      title: postContent.title,
      description: postContent.description,
    }
    const post = JSON.stringify(p)
    const message = currentDate.getTime().toString() + '#' + post
    console.log(`Posting your anonymous greeting...`)
    let cid
    try {
      cid = await uploadIPFS(message)
      if (!cid) {
        throw Error('Upload to IPFS failed')
      }

      onIPFSUploadSuccess(p, cid)

      console.log(`IPFS CID: ${cid}`)
      const signal = getBytes32FromIpfsHash(cid)

      const userPosting = new Identity(`${address}_${this.groupId}_${postedByUser?.name}`)
      const unirepUser = new UnirepUser(userPosting)
      await unirepUser.updateUserState()
      const userState = await unirepUser.getUserState()

      let reputationProof = await userState.genProveReputationProof({
        epkNonce: 0,
        minRep: MIN_REP_POST,
        graffitiPreImage: 0,
      })

      const extraNullifier = hashBytes(signal).toString()
      const identityCommitment = BigInt(userPosting.getCommitment().toString())
      const note = await createNote(userPosting)
      const u = users.filter(u => u?.groupId === +this.groupId)
      const g = new Group(groupId)
      g.addMembers(u.map(u => u?.identityCommitment))
      const { proof, merkleTreeRoot, nullifierHash } = await generateProof(
        userPosting,
        g,
        extraNullifier,
        hashBytes(signal)
      )

      const { epochKey, publicSignals, proof: epochProof, epoch: ownerEpoch } = unirepUser.getEpochData()
      const epoch: ReputationProofStruct = {
        publicSignals: publicSignals,
        proof: epochProof,
        publicSignalsQ: reputationProof.publicSignals,
        proofQ: reputationProof.proof,
        ownerEpoch: BigNumber.from(ownerEpoch)?.toString(),
        ownerEpochKey: epochKey,
      }

      return await createPost(
        signal,
        note,
        this.groupId,
        merkleTreeRoot.toString(),
        nullifierHash.toString(),
        proof,
        epoch
      ).then(async res => {
        const { data } = res
        const postIdHex = data.args[2].hex
        const postId = parseInt(postIdHex, 16)
        await this.cacheNewPost(p, postId, groupId, note, cid, setWaiting)
        return res
      })
    } catch (error) {
      // this.undoNewPost(groupId, cid);
      throw error
    }
  }

  async edit(
    postContent: PostContent,
    address: string,
    itemId,
    users: User[],
    postedByUser: User,
    groupId: string,
    setWaiting: Function
  ) {
    let currentDate = new Date()
    const post = JSON.stringify(postContent)
    const message = currentDate.getTime().toString() + '#' + post
    console.log(`Editing your anonymous post...`)
    let cid
    try {
      cid = await uploadIPFS(message)
      if (!cid) {
        throw Error('Upload to IPFS failed')
      }

      console.log(`IPFS CID: ${cid}`)
      const signal = getBytes32FromIpfsHash(cid)

      //const extraNullifier = hashBytes(signal).toString();
      //const g = new Group();
      const userPosting = new Identity(`${address}_${this.groupId}_${postedByUser?.name}`)
      const note = await createNote(userPosting)

      const item = await forumContract.itemAt(itemId)
      let input = {
        note: BigInt(item.note.toHexString()),
        trapdoor: userPosting.getTrapdoor(),
        nullifier: userPosting.getNullifier(),
      }

      //const u = users.filter(u => u?.groupId === +this.groupId);
      //g.addMembers(u.map(u => u?.identityCommitment))
      const { a, b, c } = await generateGroth16Proof(
        input,
        '/circuits/VerifyOwner__prod.wasm',
        '/circuits/VerifyOwner__prod.0.zkey'
      )
      return edit(itemId, signal, note, a, b, c).then(async data => {
        await this.cacheUpdatedPost(postContent, itemId, groupId, cid, note, setWaiting) //we update redis with a new 'temp' comment here
        return data
      })
    } catch (error) {
      // this.undoNewPost(groupId, cid);
      throw error
    }
  }

  async delete(address: string, itemId, users: User[], postedByUser: User, groupId: string, setWaiting: Function) {
    console.log(`Removing your anonymous post...`)
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
        await this.removeFromCache(itemId) //we update redis with a new 'temp' comment here
        return data
      })
    } catch (error) {
      throw error
    }
  }

  async updatePostsVote(postInstance, itemId, voteType, confirmed: boolean, revert = false) {
    //from the community level (multple posts)
    const modifier = revert ? -1 : 1
    try {
      itemId = itemId.toNumber()
    } catch {
      itemId = +itemId
    }

    console.log('updatePostsVote', {
      postInstance,
      itemId,
      voteType,
      confirmed,
      revert,
      cachedId: postInstance.groupCacheId(),
    })

    mutate(
      postInstance.groupCacheId(),
      postList => {
        console.log('postList', postList)
        if (!postList?.length) return // should exist tho.
        const postIndex = postList.findIndex(p => {
          console.log('p', { p, itemId }, p.id === itemId)
          return +p.id === itemId
        })
        console.log('postIndex', postIndex, postList)
        if (postIndex > -1) {
          console.log('postIndex > -1', postIndex, postList)
          const postToUpdate = { ...postList[postIndex] }
          if (voteType === 0 && (!confirmed || revert)) {
            postToUpdate.upvote += 1 * modifier
          }

          if (voteType === 1 && (!confirmed || revert)) {
            postToUpdate.downvote += 1 * modifier
          }

          if (confirmed) {
            delete postToUpdate.voteUnconfirmed
          } else {
            postToUpdate.voteUnconfirmed = true
          }

          postList[postIndex] = postToUpdate

          if (confirmed) {
            setCacheAtSpecificPath(
              this.specificPostId(itemId),
              voteType === 0 ? postList[postIndex].upvote : postList[postIndex].downvote,
              voteType === 0 ? '$.data.upvote' : '$.data.downvote'
            )
          }
        }

        return [...postList]
      },
      { revalidate: false }
    )
  }

  async updatePostVote(voteType, confirmed = false, revert = false) {
    // Verify the vote type is within the expected range (0 or 1)
    if (![0, 1].includes(voteType)) {
      throw new Error('Invalid vote type. Expected 0 (upvote) or 1 (downvote)')
    }

    // Determine if we should increment or decrement vote counts
    const modifier = revert ? -1 : 1

    try {
      mutate(
        this.postCacheId(),
        async posts => {
          // Ensure posts are not undefined or null
          if (!posts) {
            throw new Error('Posts not found in cache')
          }

          const postToUpdate = { ...posts }

          if (voteType === 0 && (!confirmed || revert)) {
            postToUpdate.upvote += 1 * modifier
          }

          if (voteType === 1 && (!confirmed || revert)) {
            postToUpdate.downvote += 1 * modifier
          }

          if (confirmed) {
            // Only delete voteUnconfirmed if it exists in the object
            if ('voteUnconfirmed' in postToUpdate) {
              delete postToUpdate.voteUnconfirmed
            }

            // Update the cache at the specific post ID
            setCacheAtSpecificPath(
              this.specificPostId(postToUpdate.id),
              voteType === 0 ? postToUpdate.upvote : postToUpdate.downvote,
              voteType === 0 ? '$.data.upvote' : '$.data.downvote'
            )
          } else {
            postToUpdate.voteUnconfirmed = true
          }

          return postToUpdate
        },
        { revalidate: false }
      )
    } catch (error) {
      console.error('Error updating post vote:', error)
      throw error
    }
  }

  async vote(voteType, address, users, postedByUser, itemId, groupId) {
    try {
      // Validate parameters
      if (!address) throw new Error('Invalid address')
      if (!Array.isArray(users)) throw new Error('Invalid users array')
      if (!itemId) throw new Error('Invalid item ID')
      if (!groupId) throw new Error('Invalid group ID')

      const voteCmdNum = hashBytes2(+itemId, 'vote')
      const signal = utils.hexZeroPad('0x' + voteCmdNum.toString(16), 32)
      const extraNullifier = voteCmdNum.toString()
      const g = new Group(groupId)
      const userPosting = new Identity(`${address}_${this.groupId}_${postedByUser?.name}`)

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
        graffitiPreImage: 0,
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
      throw error
    }
  }

  cacheNewPost = async (post, postId, groupId, note: BigInt, contentCID, setWaiting) => {
    const parsedPost = parsePost(post)
    const newPost = {
      ...parsedPost,
      createdAt: new Date(Date.now()),
      id: postId, // a non-numeric lets us know it's unconfirmed until registered on the blockchain
      upvote: 0,
      downvote: 0,
      note: BigNumber.from(note),
      contentCID,
    }

    await setCache(this.specificPostId(postId), newPost) // update the cache with the new post

    mutate(
      this.groupCacheId(),
      posts => {
        const postsCopy = [...posts]
        postsCopy.unshift(newPost)
        return postsCopy
      },
      { revalidate: false }
    ) //update react's state

    setWaiting(false)
  }

  cacheUpdatedPost = async (post, postId, groupId, contentCID, note, setWaiting) => {
    await mutate(
      this.postCacheId(),
      async postFromCache => {
        console.log(postFromCache)
        const updatedPost = { ...postFromCache, ...post, contentCID, note: BigNumber.from(note) }

        await setCacheAtSpecificPath(this.specificPostId(postId), updatedPost, '$.data')
        return { ...updatedPost }
      },
      { revalidate: false }
    )
    setWaiting(false)
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
          await removeAt(this.specificPostId(postId), '$')
        }
        return postsCopy
      },
      { revalidate: false }
    )
  }
}
