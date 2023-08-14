import clsx from 'clsx'
import { PrimaryButton } from '@components/buttons'
import { CircularProgress } from '@components/CircularProgress'
import { CircularLoader } from '@components/JoinCommunityButton'

export const Pagination = ({ currentPage = 1, totalPages, onPageChange }) => {
  const radius = 100
  const sliceAngle = 360 / totalPages
  return (
    <div className="sticky left-0 top-0 z-30  my-1  flex select-none items-center rounded border-white bg-gray-50/50 p-2 text-white">
      <PrimaryButton
        resetClasses={true}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="-me-2 h-8 w-28 rounded-l bg-primary-500  px-2 py-1 hover:bg-primary-500/50 focus:select-none focus:outline-none disabled:bg-primary-300 disabled:hover:bg-primary-300"
      >
        Previous
      </PrimaryButton>
      {!totalPages ? (
        <CircularLoader className={'aspect-1 !w-20 !h-20 !rounded-full bg-primary-500'} />
      ) : (
        <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border-none  bg-primary-400">
          <svg
            viewBox={`-${radius} -${radius} ${radius * 2} ${radius * 2}`}
            className="absolute left-0 top-0 h-full w-full rounded-full   outline outline-4 -outline-offset-4 outline-primary-400"
          >
            {Array.from({ length: totalPages }).map((_, i) => (
              <PieSlice
                key={i}
                radius={radius}
                startAngle={i * sliceAngle}
                endAngle={(i + 1) * sliceAngle}
                filled={i < currentPage + 1}
              />
            ))}
          </svg>
          <div className="absolute flex aspect-1 items-center justify-center rounded-full border border-white bg-primary-400 p-3 text-xs">
            {currentPage + 1} / {totalPages}
          </div>
        </div>
      )}
      <PrimaryButton
        resetClasses={true}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className=" -ms-2 h-8 w-28 select-none rounded-r bg-primary-500 px-2 py-1 hover:bg-primary-500/50 focus:select-none   focus:outline-none disabled:bg-primary-300 disabled:hover:bg-primary-300"
      >
        Next
      </PrimaryButton>
    </div>
  )
}

const PieSlice = ({ radius, startAngle, endAngle, filled }) => {
  const x1 = radius * Math.cos((Math.PI * startAngle) / 180)
  const y1 = radius * Math.sin((Math.PI * startAngle) / 180)
  const x2 = radius * Math.cos((Math.PI * endAngle) / 180)
  const y2 = radius * Math.sin((Math.PI * endAngle) / 180)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

  return (
    <path
      className={clsx('text-white', filled ? 'fill-primary-500' : 'fill-primary-400')}
      d={`M0,0 L${x1},${y1} A${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2} z`}
      stroke="white"
      strokeWidth="0.5"
    />
  )
}
