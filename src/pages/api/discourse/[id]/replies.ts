import { LRUCache } from 'lru-cache'
import { NextApiRequest, NextApiResponse } from 'next'

const options = {
  max: 500, // Maximum of 500 items in the cache
  ttl: 1000 * 60 * 5, // Items live for 5 minutes
  dispose: (value, key) => {
    // Optional: Add logic here to clean up anything if necessary
  }
}

const cache = new LRUCache<string, any>(options)

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const url = `https://logos.discourse.group/posts/${id}/replies.json`

  const cachedData = cache.get(url)

  if (cachedData) {
    return res.json(cachedData)
  }

  const response = await fetch(url)
  const data = await response.json()

  cache.set(url, data)

  res.json(data)
}
