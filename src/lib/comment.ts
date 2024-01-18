import type { PostContent, User } from './model'
import { create, editContent, handleDeleteItem } from '@/lib/item'
import type { Address } from '@/types/common'
import type { BigNumberish } from '@semaphore-protocol/group'

interface CreateParams {
  commentContent: PostContent
  address: Address
  users: User[]
  postedByUser: User
  groupId: BigNumberish
  setWaiting: (waiting: boolean) => void
  onIPFSUploadSuccess: (comment: string, cid: string) => void
}

interface EditParams {
  commentContent: PostContent
  address: Address
  itemId: BigNumberish
}

export class CommentClass {
  id?: BigNumberish
  groupId: BigNumberish
  postId: BigNumberish

  constructor(groupId: BigNumberish, postId: BigNumberish, id?: BigNumberish) {
    this.groupId = groupId
    this.postId = postId
    this.id = id
  }

  commentsCacheId() {
    return this.postId + '_comments'
  }

  async create({ commentContent, address, onIPFSUploadSuccess }: CreateParams) {
    return await create.call(
      {
        groupId: this.groupId,
        postId: this.postId,
      },
      {
        content: commentContent,
        type: 'comment',
        address,
        onIPFSUploadSuccess,
      }
    )
  }

  async edit({ commentContent, address, itemId }: EditParams) {
    return await editContent.call(
      { groupId: this.groupId, postId: this.postId },
      {
        type: 'comment',
        content: commentContent,
        address,
        itemId,
      }
    )
  }

  async delete(address: Address, itemId: BigNumberish) {
    return await handleDeleteItem.call(this, address, itemId)
  }
}
