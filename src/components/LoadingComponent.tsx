import LottieControl from '@components/LottieLoader'

const LoadingComponent = () => {
  return (
    <div className={'fixed inset-0 z-[5000] flex h-screen w-full items-center justify-center bg-black/50'}>
      <LottieControl />
    </div>
  )
}

export default LoadingComponent
