import clsx from 'clsx'

export const CircularProgress = ({ className = 'h-32 w-32 ' }) => {
  return (
    <div className="flex items-center justify-center">
      <div className={clsx('animate-spin rounded-full border-b-2 border-gray-900', className)}></div>
    </div>
  )
}
