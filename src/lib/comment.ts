import { BigNumber } from 'ethers'
import { mutate } from 'swr'
import { User } from './model'
import { getCache, removeAt, setCache } from './redis'
import { create, editContent, handleDeleteItem, updateContentVote} from '@/lib/item'

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
    return await handleDeleteItem.call(this, address, postedByUser, itemId)
  }

  async updateCommentsVote(itemId, voteType, confirmed: boolean, revert = false) {
    updateContentVote.call(this, itemId, voteType, confirmed, 'comment', revert)
  }


}
