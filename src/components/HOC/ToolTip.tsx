export default function ToolTip({ tooltip, children }) {
  return (
    <div className="group relative flex">
      {children}
      {tooltip && (
        <span className="absolute left-full  top-0 flex h-full scale-0 items-center rounded bg-gray-800/80 p-2 text-xs text-white transition-all group-hover:z-[150] group-hover:scale-100">
          {tooltip}
        </span>
      )}
    </div>
  )
}
