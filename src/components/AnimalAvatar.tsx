import { generateAvatar } from '@/lib/utils'
import type { AvatarOptions } from 'animal-avatar-generator'
import React, { useEffect, useState } from 'react'

interface AnimalAvatarProps {
  seed: string
  options?: AvatarOptions
}

const AnimalAvatar = ({ seed, options = {} }: AnimalAvatarProps) => {
  const [avatar, setAvatar] = useState<string>('')

  useEffect(() => {
    generateAvatarFn()
  }, [seed])

  const generateAvatarFn = async () => {
    if (seed) {
      const generatedAvatar = await generateAvatar(seed, {
        size: 60,
        blackout: true,
        ...options,
      })
      setAvatar(
        `data:image/svg+xml;utf8,${encodeURIComponent(generatedAvatar)}`
      )
    } else {
      setAvatar(
        'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'
      )
    }
  }
  return <img className="mr-auto" src={avatar} alt={'avatar'} />
}

export default AnimalAvatar
