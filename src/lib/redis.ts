'use client'

import { Redis } from '@upstash/redis'
import _ from 'lodash'

const TTLmaxAgeMinutes = 3 //TTL of the cache. How long to hold a cache before refreshing it without interruption to the user
let redisClient: Redis

const getRedisClient = async () => {
  if (!process.env.NEXT_PUBLIC_REDIS_URL) {
    throw new Error('NEXT_PUBLIC_REDIS_URL not defined')
  }

  if (!process.env.NEXT_PUBLIC_REDIS_TOKEN) {
    throw new Error('NEXT_PUBLIC_REDIS_TOKEN not defined')
  }

  return new Redis({
    url: process.env.NEXT_PUBLIC_REDIS_URL,
    token: process.env.NEXT_PUBLIC_REDIS_TOKEN,
  })
}

const dateStamp = (data: string) => {
  return [data, Date.now().toString()]
}

const refreshCache = (cachedDate: string) => {
  /*
    caches can get stale for any number of reasons esp during high traffic
    We need to ensure it is at least x minutes fresh
    This is standard practice for caching in high traffic systems
    */
  if (!cachedDate) return true

  const currentDate = Number(dateStamp('x')[1])
  const timeDifference = (currentDate - Number(cachedDate)) / 60_000
  return timeDifference > TTLmaxAgeMinutes
}

export const setCache = async (key: string, value: any, path = '$') => {
  console.log('setCache', key, value)
  const datedValue = dateStamp(value)

  if (!redisClient) {
    console.log('redisClient not found - initializing')
    redisClient = await getRedisClient()
  }
  redisClient.json
    .set(key, path, {
      data: value,
      lastCachedAt: Date.now().toString(),
    })
    .then(
      success => {
        console.log('caching successful', key, value)
      },
      fail => {
        console.error({ fail, key, value })
      }
    )
    .catch(error => {
      console.error('redisClient error ', error)
    })
}

export const setCacheAtSpecificPath = async (key: string, value: any, path = '$') => {
  if (!redisClient) {
    redisClient = await getRedisClient()
  }

  return redisClient.json
    .set(key, path, value)
    .then(
      async success => {
        console.log('redisClient caching successful', key, path, value)
        await updateLastCachedAt(key)
      },
      fail => {
        console.error('redisClient', { fail, key, value })
      }
    )
    .catch(error => {
      console.error('redisClient error ', error)
    })
}

export const getMCache2 = async (keys: string[], withCleanUp = false): Promise<{ cache; refresh: boolean }[]> => {
  if (!redisClient) {
    redisClient = await getRedisClient()
  }
  console.log('getMCache', keys)

  let cachedResults
  try {
    cachedResults = await redisClient.json.mget(keys, '.') // get entire JSON object for each key
  } catch (error) {
    console.log(keys, error)
    return []
  }

  const cleanupPromises = []

  const results = cachedResults.map((cachedResult, index) => {
    let cache
    if (cachedResult && 'data' in cachedResult) {
      const { data } = cachedResult
      cache = data
      if (cachedResult.hasOwnProperty('lastCachedAt')) {
        const { lastCachedAt } = cachedResult
        cache['refresh'] = refreshCache(lastCachedAt)
      }
    } else {
      cache = cachedResult
    }
    const refresh = false

    if (withCleanUp) {
      const cleanupPromise = cacheCommunityCleanUp(cache, keys[index]).catch(error => {
        console.error(keys[index], error, 'Error cleaning up cache')
      })
      cleanupPromises.push(cleanupPromise)
    }
    return { cache, refresh: cache?.['refresh'] ?? refresh }
  })

  // Wait for all cleanup operations to complete
  await Promise.all(cleanupPromises)

  return results
}

export const getCache = async (key: string, withCleanUp = false): Promise<{ cache; refresh: boolean }> => {
  if (!redisClient) {
    redisClient = await getRedisClient()
  }
  console.log('getCache', key)

  let cache
  try {
    const cachedResult = await redisClient.json.get(key)
    // Check if 'data' key exists in the cachedResult
    if (cachedResult && 'data' in cachedResult) {
      const { data } = cachedResult
      cache = data
      if (cachedResult.hasOwnProperty('lastCachedAt')) {
        const { lastCachedAt } = cachedResult
        cache['refresh'] = refreshCache(lastCachedAt)
      }
    } else {
      // If 'data' key does not exist, return the entire cachedResult as cache
      cache = cachedResult
    }
  } catch (error) {
    console.log(key, error)
  }
  const refresh = false

  if (withCleanUp) {
    try {
      await cacheCommunityCleanUp(cache, key)
    } catch (error) {
      console.error(key, error, 'Error cleaning up cache')
    }
  }

  return { cache, refresh: cache?.['refresh'] ?? refresh }
}

const cacheCommunityCleanUp = async (key, cache) => {
  if (
    key.startsWith('group_') &&
    (!cache.hasOwnProperty('note') || !cache.hasOwnProperty('id') || !cache.hasOwnProperty('groupId'))
  ) {
    console.log('cache missing required properties - deleting', key, cache)
    // Remove the cache if it doesn't have the required properties
    await redisClient.del(key)
    cache = null
  }
}

export const getMCache = async (key: string[], flatten = false): Promise<{ cache; refresh: boolean }> => {
  if (!redisClient) {
    redisClient = await getRedisClient()
  }

  let data = []
  let cache
  let cachedDate: string | null = ''
  try {
    const cachedResult = await redisClient.json.mget(key, '$')
    cache = cachedResult
    if (flatten) cache = _.flatten(cachedResult)

    cachedDate = null
    console.log(data, cachedDate, cache)
  } catch (error) {
    console.error(key, error)
    cache = []
  }

  const refresh = false

  return { cache, refresh }
}

/** Utilities */

const updateLastCachedAt = async key => {
  await redisClient.json.set(key, '$.lastCachedAt', Date.now().toString())
}

export const insertAtTop = async (key, value) => {
  try {
    await redisClient.json.arrinsert(key, '$.data', value)
    await updateLastCachedAt(key)
  } catch (error) {
    console.log(key, error)
  }
}

export const insertAtBottom = async (key, value) => {
  try {
    await redisClient.json.arrappend(key, '$.data', value)
    await updateLastCachedAt(key)
  } catch (error) {
    console.log(key, error)
  }
}

export const removeAt = async (key, path) => {
  try {
    await redisClient.json.del(key, path)
  } catch (error) {}
}

export const updateAt = async (key, value) => {
  redisClient.json.arrindex(key, '$.data.*', JSON.stringify({ id: 0 }))
}
