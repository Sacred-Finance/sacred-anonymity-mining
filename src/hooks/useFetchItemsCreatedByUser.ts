import { forumContract } from '@/constant/const'
import { ContentType } from '@/lib/model'
import { createNote } from '@/lib/utils'
import { Item } from '@/types/contract/ForumInterface'
import { augmentItemData } from '@/utils/communityUtils'
import { Identity } from '@semaphore-protocol/identity'
import { ethers } from 'ethers'
import { groupBy } from 'lodash'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useAccount } from 'wagmi'

export const useFetchItemsCreatedByUser = () => {
  const { address } = useAccount()
  const [itemsGrouped, setItemsGrouped] = useState<{ [contentType: string]: any[] }>({
    [ContentType.POST]: [],
    [ContentType.COMMENT]: [],
    [ContentType.POLL]: [],
  })
  useEffect(() => {
    forumContract
      .queryFilter(forumContract.filters.NewItem(), 0, 'latest')
      .then(async res => {
        const items: Item[] = []
        const itemsCreatedByMe = []

        /**
         * This loop is implemented separately rather than iterating over res directly once
         * because we need to wait for the note to be created before we can compare it to the note and if we do it in the same loop
         * we will have to wait for the note to be created for all items before we can compare it to the note also it throws webassemby related error
         */
        for (const item of res) {
          const decodedItem = item.decode?.(item.data, item.topics)
          const identity = new Identity(`${address}_${Number(decodedItem.groupId)}_anon`)
          const note = await createNote(identity)
          if (
            decodedItem.contentCID &&
            decodedItem.contentCID !== ethers.constants.HashZero &&
            note.toString() === decodedItem.note.toString()
          ) {
            itemsCreatedByMe.push(decodedItem)
          }
        }
        const data = itemsCreatedByMe.map(async (decodedItem: any) => {
          const rawItemData = await forumContract.itemAt(Number(decodedItem.id))
          const item = await augmentItemData(rawItemData)
          return Promise.resolve(items.push(item))
        })

        await Promise.all(data)

        setItemsGrouped(groupBy(items, 'kind'))
      })
      .catch(err => {
        console.log(err)
        toast.error(err.message ?? err)
        setItemsGrouped({
          [ContentType.POST]: [],
          [ContentType.COMMENT]: [],
          [ContentType.POLL]: [],
        })
      })
  }, [address])

  return {
    posts: itemsGrouped[ContentType.POST],
    comments: itemsGrouped[ContentType.COMMENT],
    polls: itemsGrouped[ContentType.POLL],
  }
}
