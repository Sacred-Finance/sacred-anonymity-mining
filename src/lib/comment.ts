import { Group } from '@semaphore-protocol/group'
import { Identity } from '@semaphore-protocol/identity'
import { generateProof } from '@semaphore-protocol/proof'
import { BigNumber, ethers } from 'ethers'
import { mutate } from 'swr'
import { createComment, edit } from './api'
import { ReputationProofStruct, User } from './model'
import { getCache, getMCache, removeAt, setCache, setCacheAtSpecificPath } from './redis'
import {
  createNote,
  generateGroth16Proof,
  getBytes32FromIpfsHash,
  getContent,
  getIpfsHashFromBytes32,
  hashBytes,
  uploadIPFS,
} from './utils'
import { UnirepUser } from './unirep'
import {forumContract, ForumContractAddress, jsonRPCProvider} from '../constant/const'

const minRepsComment = 1

export class CommentClass {
  postId: string
  id: string
  groupId: string

  constructor(groupId, postId, id: string) {
    this.id = id
    this.postId = postId
    this.groupId = groupId
  }

  commentsCacheId() {
    console.log(`commentsCacheId: ${this.postId}_comments`)
    return this.postId + '_comments'
  }

  specificCommentId(commentId?) {
    console.log(`specificCommentId: ${this.postId}_comment_${this.id ?? commentId}`)
    return `${this.postId}_comment_${this.id ?? commentId}`
  }

  async create(
    commentContent,
    address: string,
    users: User[],
    postedByUser: User,
    groupId: string,
    setWaiting: Function,
    onIPFSUploadSuccess: (comment, cid) => void
  ) {
    let cid
    let currentDate = new Date()
    const message = currentDate.getTime().toString() + '#' + JSON.stringify(commentContent)
    console.log(`Posting your anonymous comment...`)
    try {
      const cid = await uploadIPFS(message)
      if (!cid) {
        throw Error('Upload to IPFS failed')
      }
      console.log(`IPFS CID: ${cid}`)

      onIPFSUploadSuccess(commentContent, cid)
      const signal = getBytes32FromIpfsHash(cid)
      const userPosting = new Identity(`${address}_${this.groupId}_${postedByUser?.name}`)
      const unirepUser = new UnirepUser(userPosting)
      await unirepUser.updateUserState()
      const userState = await unirepUser.getUserState()

      let reputationProof = await userState.genProveReputationProof({
        epkNonce: 0,
        minRep: minRepsComment,
        graffitiPreImage: 0,
      })

      const extraNullifier = hashBytes(signal.toString()).toString()
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

      const epochData = unirepUser.getEpochData()
      const epoch: ReputationProofStruct = {
        publicSignals: epochData.publicSignals,
        proof: epochData.proof,
        publicSignalsQ: reputationProof.publicSignals,
        proofQ: reputationProof.proof,
        ownerEpoch: BigNumber.from(epochData.epoch)?.toString(),
        ownerEpochKey: epochData.epochKey,
      }

      //don't await. Create it. If succees, update redis with success, else delete redis
      return createComment(
        signal.toString(),
        note,
        this.groupId,
        this.postId,
        merkleTreeRoot.toString(),
        nullifierHash.toString(),
        proof,
        epoch
      ).then(async res => {
        const { data } = res
        const commentHex = data.args[2].hex
        const commentId = parseInt(commentHex, 16)
        await this.cacheNewComment(commentContent, commentId, note, cid, setWaiting) //we update redis with a new 'temp' comment here
        return res
      })
    } catch (error) {
      // this.undoNewCommentCache(cid);
      throw error
    }
  }

  undoNewCommentCache = async (ipfsHash: string) => {
    const comments = (await this.getCachedComments()).filter(comment => comment.id != ipfsHash) || []

    mutate(this.commentsCacheId(), comments, { revalidate: false }) //update react's state
  }

  cacheUpdatedComment = async (comment, commentId, groupId, note, contentCID, setWaiting) => {
    await mutate(this.commentsCacheId(), async commentsFromCache => {
      console.log(commentsFromCache)
      const commentIndex = commentsFromCache.findIndex(p => {
        return +p.id == +commentId || +this.id == BigNumber.from(p.id).toNumber()
      })
      commentsFromCache[commentIndex] = { ...commentsFromCache[commentIndex], ...comment, contentCID, note }

      await Promise.allSettled([
        setCacheAtSpecificPath(
          this.specificCommentId(commentId),
          commentsFromCache[commentIndex]?.content,
          '$.data.content'
        ),
        setCacheAtSpecificPath(this.specificCommentId(commentId), JSON.stringify(contentCID), '$.data.contentCID'),
        setCacheAtSpecificPath(this.specificCommentId(commentId), BigNumber.from(note), '$.data.note'),
      ])

      return [...commentsFromCache]
    })

    // mutate(this.commentsCacheId(), comments, { revalidate: false }); //update react's state

    setWaiting(false)
  }

  async getComments() {
    const getData = async () => {
      const itemIds = await forumContract.getCommentIdList(this.postId);
      const rawComments = await Promise.all(itemIds.map((i) => forumContract.itemAt(i.toNumber())));
      let p = [];
      for (const c of rawComments) {
        if (!c?.removed &&  ethers.constants.HashZero !== c?.contentCID) {
          try {
            const content = await getContent(getIpfsHashFromBytes32(c?.contentCID));
            const block = await jsonRPCProvider.getBlock(c.createdAtBlock.toNumber());
            let parsedContent;
            try {
              parsedContent = JSON.parse(content);

            } catch (error) {
              parsedContent = content
            }
            const postData = {
              content: parsedContent,
              createdAt: new Date(block.timestamp * 1000),
              id: c.id.toString(),
              upvote: c.upvote?.toNumber(),
              downvote: c.downvote?.toNumber(),
              note: BigNumber.from(c?.note),
              contentCID: getIpfsHashFromBytes32(c?.contentCID)
            }
            p.push(postData);
            await setCache(this.specificCommentId(c?.id?.toNumber()), postData)
          } catch (error) {
            console.log(error)
          }
        }
      }
      p = p.sort((d1, d2) => d2.createdAt < d1.createdAt ? 1 : -1)
      console.log({ p });
      return p;
    }

    try {
      const itemIds = await forumContract.getCommentIdList(this.postId);
      if (!itemIds?.length) {
        return [];
      }

      const { cache: mCache, refresh: mRefresh } = await getMCache(itemIds.map(i => this.specificCommentId(i.toNumber())));

      console.log(mCache);

      if (true) {
        return (mCache?.map(c => c ? c[0] : null)).filter(a => a && !a?.removed).map(c => c?.data)


      } else {
        return getData();
      }
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  getCachedComments = async () => {
    const { cache } = await getCache(this.commentsCacheId())

    if (cache) {
      const dateFixed = cache?.map(comment => {
        comment.createdAt = new Date(comment.createdAt) //convert string to date object
        return comment
      })
      return dateFixed
    } else {
      return []
    }
  }

  cacheNewComment = async (content, commentId, note, contentCID, setWaiting) => {
    const newComment = {
      content: content,
      createdAt: new Date(Date.now()),
      id: commentId, // a non-numeric lets us know it's unconfirmed until registered on the blockchain
      upvote: 0,
      downvote: 0,
      note: BigNumber.from(note),
      contentCID,
    }
    // setCache(this.commentsCacheId(), comments);// update the cache with the new comment
    setCache(this.specificCommentId(commentId), newComment)
    mutate(
      this.commentsCacheId(),
      comments => {
        const commentsCopy = [...comments]
        commentsCopy.push(newComment)
        return commentsCopy
      },
      { revalidate: false }
    ) //update react's state
    setWaiting(false)
  }

  async edit(commentContent, address: string, itemId, postedByUser: User, groupId: string, setWaiting: Function) {
    let currentDate = new Date()
    const message = currentDate.getTime().toString() + '#' + JSON.stringify(commentContent)
    console.log(`Editing your anonymous Comment...`)
    let cid
    try {
      cid = await uploadIPFS(message)
      if (!cid) {
        throw Error('Upload to IPFS failed')
      }

      //            this.cacheNewPost(post, cid, groupId, setWaiting); //we update redis with a new 'temp' comment here

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
      const { a, b, c } = await generateGroth16Proof(
        input,
        '/circuits/VerifyOwner__prod.wasm',
        '/circuits/VerifyOwner__prod.0.zkey'
      )
      return await edit(itemId, signal, note, a, b, c).then(async data => {
        await this.cacheUpdatedComment(commentContent, itemId, groupId, note, cid, setWaiting) //we update redis with a new 'temp' comment here
        return data
      })
    } catch (error) {
      // this.undoNewPost(groupId, cid);
      throw error
    }
  }

  async delete(address: string, itemId, users: User[], postedByUser: User, groupId: string, setWaiting: Function) {
    console.log(`Removing your anonymous comment...`)
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

  async updateCommentsVote(itemId, voteType, confirmed: boolean, revert = false) {
    const modifier = revert ? -1 : 1
    try {
      itemId = itemId.toNumber()
    } catch {
      itemId = +itemId
    }

    mutate(
      this.commentsCacheId(),
      async commentsList => {
        const commentIndex = commentsList.findIndex(p => +p.id === itemId)
        if (commentIndex > -1) {
          const commentToUpdate = { ...commentsList[commentIndex] }
          if (voteType === 0 && (!confirmed || revert)) {
            commentToUpdate.upvote += 1 * modifier
          }

          if (voteType === 1 && (!confirmed || revert)) {
            commentToUpdate.downvote += 1 * modifier
          }

          if (confirmed) {
            delete commentToUpdate.voteUnconfirmed
          } else {
            commentToUpdate.voteUnconfirmed = true
          }

          commentsList[commentIndex] = commentToUpdate
        }
        if (confirmed) {
          setCacheAtSpecificPath(
            this.specificCommentId(itemId),
            voteType === 0 ? commentsList[commentIndex].upvote : commentsList[commentIndex].downvote,
            voteType === 0 ? '$.data.upvote' : '$.data.downvote'
          )
        }
        return [...commentsList]
      },
      { revalidate: false }
    )
  }

  removeFromCache = async commentId => {
    mutate(
      this.commentsCacheId(),
      async comments => {
        const commentsCopy = [...comments]
        if (commentsCopy?.length) {
          const i = comments.findIndex(p => +p.id == commentId)
          if (i > -1) {
            commentsCopy.splice(i, 1)
          }
          await removeAt(this.specificCommentId(commentId), '$')
        }
        return commentsCopy
      },
      { revalidate: false }
    )
  }
}
