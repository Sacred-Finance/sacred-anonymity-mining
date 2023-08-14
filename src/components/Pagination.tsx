import clsx from 'clsx'
import { PrimaryButton } from '@components/buttons'

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="sticky left-0 top-0 z-30  my-1 flex items-center rounded bg-gray-50/50 p-2 text-white select-none">
      <PrimaryButton
        resetClasses={true}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="z-10 -me-3 h-8 w-28 rounded-l  bg-primary-500 px-2 py-1 hover:bg-primary-500/50 focus:select-none focus:outline-none disabled:hover:bg-primary-500/90"
      >
        Previous
      </PrimaryButton>
      <div className="z-20 flex aspect-1 items-center rounded-full border-4 bg-primary-500 p-3 ring-2 ring-primary-500 ring-offset-2 ring-offset-gray-100">
        {currentPage + 1} / {totalPages}
      </div>
      <PrimaryButton
        resetClasses={true}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className="z-10 -ms-3 h-8 w-28 select-none rounded-r bg-primary-500 px-2 py-1 hover:bg-primary-500/50  focus:select-none focus:outline-none disabled:hover:bg-primary-500/90"
      >
        Next
      </PrimaryButton>
    </div>
  )
}
