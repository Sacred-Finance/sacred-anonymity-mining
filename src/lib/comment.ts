import { BigNumber } from 'ethers'
import { mutate } from 'swr'
import { User } from './model'
import { getCache, removeAt, setCache } from './redis'
import {cacheNewContent, create, editContent, getAllContent, handleDeleteItem, updateContentVote} from '@/lib/item'

export const MIN_REP_COMMENT = 1

export class CommentClass {
  id: string
  groupId: string
  postId: string

  constructor(groupId, postId, id: string) {
    this.id = id
    this.postId = postId
    this.groupId = groupId
  }

  commentsCacheId() {
    return this.postId + '_comments'
  }
  cacheId() {
    return this.postId + '_comments'
  }
  specificId(commentId?) {
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
    return await create.call(
      this,
      commentContent,
      'comment',
      address,
      users,
      postedByUser,
      groupId,
      setWaiting,
      onIPFSUploadSuccess
    )
  }

  async edit(commentContent, address: string, itemId, postedByUser: User, groupId: string, setWaiting: Function) {
    return await editContent.call(this, 'comment', commentContent, address, itemId, postedByUser, groupId, setWaiting)
  }

  async delete(address: string, itemId, users: User[], postedByUser: User, groupId: string, setWaiting: Function) {
    console.log(`Removing your anonymous comment...`)
    return await handleDeleteItem.call(this, address, postedByUser, itemId)
  }

  undoNewCommentCache = async (ipfsHash: string) => {
    const comments = (await this.getCachedComments()).filter(comment => comment.id != ipfsHash) || []

    mutate(this.commentsCacheId(), comments, { revalidate: false })
  }

  async getComments() {
    return await getAllContent.call(this, 'comment')
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
    return await cacheNewContent.call(this, content, commentId, note, contentCID, setWaiting, 'comment')
  }


  async updateCommentsVote(itemId, voteType, confirmed: boolean, revert = false) {
    updateContentVote.call(this, itemId, voteType, confirmed, 'comment', revert)
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
          await removeAt(this.specificId(commentId), '$')
        }
        return commentsCopy
      },
      { revalidate: false }
    )
  }
}
