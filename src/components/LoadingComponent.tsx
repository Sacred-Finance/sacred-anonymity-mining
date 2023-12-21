import LottieControl from '@components/LottieLoader'

const LoadingComponent = () => {
  return (
    <div className="pointer-events-none fixed inset-0 flex items-center justify-center bg-black/80">
      <div className="h-3/4">
        <LottieControl />
      </div>
    </div>
  )
}

export default LoadingComponent
