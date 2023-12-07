import ToolTip from '@components/HOC/ToolTip'
import React from 'react'

const FilterButtons = ({ filters, onFilter, activeFilter, displayIcon = true, displayName = true }) => {
  return (
    <div className="flex overflow-hidden rounded border border-gray-300">
      {filters.map((filter, index) => {
        const isActive = activeFilter.includes(filter.name)

        return (
          <ToolTip key={filter.name} tooltip={filter.name}>
            <button
              onClick={() => onFilter(filter.name)}
              className={`${index !== 0 ? 'border-l border-gray-300' : ''} ${
                isActive
                  ? 'hover:bg-primary-600 bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } focus:border-primary-400 flex items-center px-4 py-2 focus:outline-none focus:ring`}
            >
              {displayIcon && <span className="">{filter.icon}</span>}
              {displayName && <span>{filter.name}</span>}
            </button>
          </ToolTip>
        )
      })}
    </div>
  )
}

export default FilterButtons
