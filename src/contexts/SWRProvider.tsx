'use client'
import { SWRConfig } from 'swr'
import { toast } from 'react-toastify'
import { useEffect, useState } from 'react'

function fetcher(resource, init) {
  return fetch(resource, init)
    .then(res => {
      if (!res.ok) {
        throw new Error('An error occurred while fetching the data.')
      }
      return res.json()
    })
    .catch(error => {
      toast.error('Network error: ' + error.message)
      // Optionally report to error logging service here
      throw error
    })
}

const localStorageProvider = (): Map<unknown, unknown> => {
  // When initializing, we restore the data from `localStorage` into a map.
  const map = new Map(JSON.parse(localStorage.getItem('app-cache') || '[]'))

  // Before unloading the app, we write back all the data into `localStorage`.
  window.addEventListener('beforeunload', () => {
    const appCache = JSON.stringify(Array.from(map.entries()))
    localStorage.setItem('app-cache', appCache)
  })

  // We still use the map for write & read for performance.
  return map
}

export const SWRProvider = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])
  if (!isMounted) return null
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: 2000,
        fetcher,
        provider: localStorageProvider,
      }}
    >
      {children}
    </SWRConfig>
  )
}
