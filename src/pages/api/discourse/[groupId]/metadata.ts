import { LRUCache } from 'lru-cache'
import type { NextApiRequest, NextApiResponse } from 'next'
import urlMetadata from 'url-metadata'

const options = {
  max: 500, // Maximum of 500 items in the cache
  ttl: 1000 * 60 * 5, // Items live for 5 minutes
  dispose: (value, key) => {
    // Optional: Add logic here to clean up anything if necessary
  },
}

const cache = new LRUCache<string, any>(options)

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const endpoint = req.headers.endpoint as string
  const readonly = req.headers.readonly ?? false

  try {
    const cachedData = cache.get(endpoint)
    if (cachedData) {
      return res.json({ ...cachedData, readonly })
    }
    let metadata: any = await urlMetadata(endpoint, {
      mode: 'same-origin',
      includeResponseBody: true,
    })
    metadata = { ...metadata, ...{ readonly } }
    cache.set(endpoint, metadata)
    return res.status(200).json(metadata)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
