import { Logo } from './Logo'

const LoadingComponent = () => {
  return (
    <div className="flex  h-screen items-center justify-center">
      <Logo className="w-[100vw] scale-[25%]" />
    </div>
  )
}

export default LoadingComponent
