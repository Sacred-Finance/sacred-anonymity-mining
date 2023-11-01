import axios from 'axios'
import { NextApiRequest, NextApiResponse } from 'next/types'
import { LRUCache } from 'lru-cache'
import pako, { deflate } from 'pako'

const options = {
  max: 500, // Maximum of 500 items in the cache
  ttl: 1000 * 60 * 5, // Items live for 5 minutes
  dispose: (value, key) => {
    // Optional: Add logic here to clean up anything if necessary
  },
}

const cache = new LRUCache<string, any>(options)

export const getHandler =
  (req: NextApiRequest, res: NextApiResponse, shouldCache = false) =>
  async (url: string) => {
    try {
      if (shouldCache) {
        const cachedData = cache.get(url)
        if (cachedData) {
          return res.json(cachedData)
        }
      }
      const { apikey, username } = req.headers
      const response = await axios.get(url, discourseAuthenticationHeaders(apikey as string, username as string))

      if (shouldCache) {
        cache.set(url, response.data)
      }
      res.status(200).json(response.data)
    } catch (error) {
      console.error('Error fetching data:', error) // Log the error with details
      res.status(500).json({ error: error.message })
    }
  }

export const postHandler = (req: NextApiRequest, res: NextApiResponse) => async (url: string, body: any) => {
  try {
    const { apikey, username } = req.headers
    const response = await axios.post(url, JSON.stringify(body), {
      headers: {
        ...discourseAuthenticationHeaders(apikey as string, username as string).headers,
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
    res.status(200).json(response.data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const gptPostHandler = async (url: string, body: any) => {
  try {
   return  fetch(url, {
      method: 'POST',
      headers: {
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Encoding': 'deflate',
        'origin': 'https://app.sacredprotocol.com',
      },
      body: deflate(JSON.stringify(body)),
    })
      .then(async response => {
        const message = await response.json()
        let messageDisplay = 'oops - something went wrong'
        if (message) {
          if (message.html) {
            messageDisplay = message.html
          } else {
            messageDisplay = JSON.stringify(message, null, 2)
          }

          return messageDisplay
        } else {
          return JSON.stringify(message, null, 2) //show the error as a string
        }
      })
      .catch(error => console.log(error))
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code that falls out of the range of 2xx
      throw new Error(`Request failed with status ${error.response.status}: ${JSON.stringify(error.response.data)}`)
    }
    // Other errors (network error, timeout, etc)
    throw new Error(error.message)
  }
}

export function discourseAuthenticationHeaders(apiKey?: string, username?: string) {
  return {
    headers: {
      'Api-Key': apiKey || process.env.NEXT_PUBLIC_DISCOURSE_API_KEY,
      'Api-Username': username || process.env.NEXT_PUBLIC_DISCOURSE_API_USERNAME,
    },
  }
}
