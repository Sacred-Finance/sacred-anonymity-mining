import { forumContract } from '@/constant/const'
import { ContentType } from '@/lib/model'
import { createNote } from '@/lib/utils'
import type { Item } from '@/types/contract/ForumInterface'
import { augmentItemData } from '@/utils/communityUtils'
import { Identity } from '@semaphore-protocol/identity'
import { groupBy } from 'lodash'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useAccount } from 'wagmi'

export const useFetchItemsCreatedByUser = () => {
  const { address } = useAccount()
  const [itemsGrouped, setItemsGrouped] = useState<{
    [contentType: string]: any[]
  }>({
    [ContentType.POST]: [],
    [ContentType.COMMENT]: [],
    [ContentType.POLL]: [],
  })

  useEffect(() => {
    forumContract.getEvents
      .NewItem()
      .then(async res => {
        const items: Item[] = []
        const itemsCreatedByMe = []

        for (const item of res) {
          const decodedItem = item.decode?.(item.data, item.topics)
          const identity = new Identity(address)
          const note = await createNote(identity)
          if (
            decodedItem.contentCID &&
            decodedItem.contentCID !==
              '0x0000000000000000000000000000000000000000000000000000000000000000' && // Update with Viem's equivalent of ethers.constants.HashZero
            note.toString() === decodedItem.note.toString()
          ) {
            itemsCreatedByMe.push(decodedItem)
          }
        }

        const data = itemsCreatedByMe.map(async (decodedItem: any) => {
          const rawItemData = await forumContract.read.itemAt([
            Number(decodedItem.id),
          ])
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
