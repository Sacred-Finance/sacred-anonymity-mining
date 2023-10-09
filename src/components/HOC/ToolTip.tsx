import React, { useState } from 'react'
import clsx from 'clsx'

export default function ToolTip({ tooltip, children, direction = 'right' }) {
  const [isHovered, setIsHovered] = useState(false)

  const tooltipClassNames = clsx(
    'absolute bottom-full flex items-center justify-center rounded bg-gray-800/90 p-2 text-center text-xs text-white transition-all',
    {
      'left-full ml-2 opacity-0': direction === 'right' && !isHovered,
      'right-full mr-2 opacity-0': direction === 'left' && !isHovered,
      'opacity-100': isHovered,
    }
  )

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  const clonedChild = React.cloneElement(children, {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  })

  if (!tooltip) return clonedChild
  return (
    <span className="relative inline-block">
      {clonedChild}
      <span className={tooltipClassNames} style={{ pointerEvents: 'none' }}>
        {tooltip}
      </span>
    </span>
  )
}
