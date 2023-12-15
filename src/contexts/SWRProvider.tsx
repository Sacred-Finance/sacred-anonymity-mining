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
      throw error
    })
}

const localStorageProvider = (() => {
  let initialized = false

  return (): Map<unknown, unknown> => {
    // Check if we're running in a browser environment
    if (typeof window === 'undefined') {
      return new Map() // Return an empty map in a non-browser environment
    }

    const map = new Map(JSON.parse(localStorage.getItem('app-cache') || '[]'))

    if (!initialized) {
      window.addEventListener('beforeunload', () => {
        const appCache = JSON.stringify(Array.from(map.entries()))
        localStorage.setItem('app-cache', appCache)
      })
      initialized = true
    }

    return map
  }
})()

export const SWRProvider = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])
  if (!isMounted) {
    return null
  }
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
