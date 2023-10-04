import clsx from 'clsx'

export default function ToolTip({ tooltip, children, direction = 'right' }) {
  return (
    <div className="group z-[9] contents">
      {children}
      {tooltip && (
        <span
          className={clsx(
            'absolute top-0 flex aspect-4 scale-0 items-center justify-center rounded bg-gray-800/90 p-2 text-center text-xs text-white transition-all group-hover:z-[900] group-hover:scale-100',
            direction === 'right' ? 'left-10' : 'right-10'
          )}
        >
          {tooltip}
        </span>
      )}
    </div>
  )
}
