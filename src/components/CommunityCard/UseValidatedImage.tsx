import { useEffect, useState } from 'react'

// Create an object to hold the cache
const imageCache: Record<string, string> = {}

export const useValidatedImage = (cid: string) => {
  const [src, setSrc] = useState<string>('')

  useEffect(() => {
    // If the CID is already in cache, set it and return
    if (imageCache[cid]) {
      setSrc(imageCache[cid])
      return
    }

    // If CID is not in cache and not provided, return
    if (!cid) return

    const image = new Image()
    image.src = `https://ipfs.io/ipfs/${cid}`

    image.onerror = () => {
      // Cache the invalid URL as an empty string
      imageCache[cid] = ''
      setSrc('')
    }

    image.onload = () => {
      // Cache the validated image URL
      imageCache[cid] = image.src
      setSrc(image.src)
    }
  }, [cid])

  return src
}
