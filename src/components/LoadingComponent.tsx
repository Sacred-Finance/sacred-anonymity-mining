import { DynamicLogo } from './Logo'

const LoadingPage = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <DynamicLogo className="scale-[25%]" />
    </div>
  )
}

export default LoadingPage
