import axios from 'axios'
import { NextApiResponse } from 'next/types'
import qs from 'qs'
import { LRUCache } from 'lru-cache'

const options = {
  max: 500, // Maximum of 500 items in the cache
  ttl: 1000 * 60 * 5, // Items live for 5 minutes
  dispose: (value, key) => {
    // Optional: Add logic here to clean up anything if necessary
  },
}

const cache = new LRUCache<string, any>(options)

export const getHandler =
  (res: NextApiResponse, shouldCache = false) =>
  async (url: string) => {
    try {
      if (shouldCache) {
        const cachedData = cache.get(url)
        if (cachedData) {
          return res.json(cachedData)
        }
      }
      const response = await axios.get(url, discourseAuthenticationHeaders())

      if (shouldCache) {
        cache.set(url, response.data)
      }
      res.status(200).json(response.data)
    } catch (error) {
      console.error('Error fetching data:', error) // Log the error with details
      res.status(500).json({ error: error.message })
    }
  }

export const postHandler = (res: NextApiResponse) => async (url: string, body: any) => {
  try {
    const formattedBody = qs.stringify(body)
    const response = await axios.post(url, formattedBody, {
      headers: {
        ...discourseAuthenticationHeaders().headers,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': '*/*',
        'X-Requested-With': 'XMLHttpRequest',
        // 'Access-Control-Allow-Origin': '*',
        // 'Origin': 'http://localhost:3000',
      },
    })

    res.status(200).json(response.data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export function discourseAuthenticationHeaders() {
  return {
    headers: {
      'Api-Key': process.env.NEXT_PUBLIC_DISCOURSE_API_KEY,
      'Api-Username': process.env.NEXT_PUBLIC_DISCOURSE_API_USERNAME,
    },
  }
}
