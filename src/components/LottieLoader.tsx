import React from 'react'
import type { Options } from 'react-lottie'
import Lottie from 'react-lottie'
import * as animationData from '../../public/lottie.json'

type LottieControlProps = NonNullable<unknown>

const LottieControl: React.FC<LottieControlProps> = () => {
  const defaultOptions: Options = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  }

  return <Lottie options={defaultOptions} height="50vw" width="50vw" />
}

export default LottieControl
