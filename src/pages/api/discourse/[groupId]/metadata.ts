import { LRUCache } from 'lru-cache';
import { NextApiRequest, NextApiResponse } from 'next'
import urlMetadata from 'url-metadata';
const options = {
  max: 500, // Maximum of 500 items in the cache
  ttl: 1000 * 60 * 60 * 24, // Items live for 1 day
  dispose: (value, key) => {
    // Optional: Add logic here to clean up anything if necessary
  },
}

const cache = new LRUCache<string, any>(options)

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { endpoint } = req.headers

  try {
    const cachedData = cache.get(endpoint as string)
    if (cachedData) {
      return res.json(cachedData)
    }
    const metadata = await urlMetadata(endpoint, {
      mode: 'same-origin',
      includeResponseBody: true
    });
    cache.set(endpoint as string, metadata)
    return res.status(200).json(metadata)
  } catch(error) {
    res.status(500).json({ error: error.message })

  }
}
