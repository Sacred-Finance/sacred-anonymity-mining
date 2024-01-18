import type { BigNumberish } from '@semaphore-protocol/group'
import type { PostContent, User } from './model'
import { jsonRPCProvider } from '@/constant/const'
import { create, editContent, handleDeleteItem } from '@/lib/item'
import type { Address } from '@/types/common'

interface CreatePost {
  postContent: PostContent
  address: Address
  users: User[]
  postedByUser: User
  groupId: BigNumberish
  setWaiting: (waiting: boolean) => void
  onIPFSUploadSuccess: (post: string, cid: string) => void
}

interface EditParams {
  postContent: PostContent
  address: Address
  itemId: BigNumberish
  postedByUser: User
  groupId: BigNumberish
  setWaiting: (waiting: boolean) => void
}

export class Post {
  id: BigNumberish
  groupId: BigNumberish
  provider = jsonRPCProvider

  constructor(id: BigNumberish, groupId: BigNumberish) {
    this.id = id
    this.groupId = groupId
  }

  async create({ postContent, address, onIPFSUploadSuccess }: CreatePost) {
    return await create.call(
      {
        groupId: this.groupId,
        postId: undefined,
      },
      {
        content: postContent,
        type: 'post',
        address,
        onIPFSUploadSuccess,
      }
    )
  }

  async edit({ postContent, address, itemId }: EditParams) {
    if (!this.id) {
      throw new Error('Invalid post ID')
    }
    return await editContent.call(
      { groupId: this.groupId, postId: this.id },
      {
        type: 'post',
        content: postContent,
        address,
        itemId,
      }
    )
  }

  async delete(address: Address, itemId: BigNumberish) {
    return await handleDeleteItem.call(
      {
        groupId: this.groupId,
        postId: this.id,
      },
      address,
      itemId
    )
  }
}
