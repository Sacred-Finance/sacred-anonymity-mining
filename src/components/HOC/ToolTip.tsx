export default function ToolTip({ tooltip, children }) {
  return (
    <div className="group relative z-[9]">
      {children}
      {tooltip && (
        <span className="absolute left-full top-0 flex aspect-2 scale-0 items-center justify-center rounded bg-gray-800/90 p-2 text-center text-xs text-white transition-all group-hover:z-[900] group-hover:scale-100">
          {tooltip}
        </span>
      )}
    </div>
  )
}
