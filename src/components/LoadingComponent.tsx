import LottieControl from '@components/LottieLoader'

const LoadingComponent = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 pointer-events-none">
      <div className="h-3/4">
        <LottieControl />
      </div>
    </div>
  )
}

export default LoadingComponent
