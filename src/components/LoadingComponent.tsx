import Image from 'next/image'

import { motion } from 'framer-motion'

const AnimatedImage = motion(Image)

const LoadingComponent = () => {
  return (
    <div className={'h-screen w-full'}>
      <h1>
        <span className={'text-6xl'}>Loading</span>
      </h1>
      <AnimatedImage
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        src={'/logo.svg'}
        className={'animate-pulse '}
        width={200}
        height={200}
        alt={'logo'}
        unoptimized
        fetchPriority={'high'}
      />
    </div>
  )
}

export default LoadingComponent
