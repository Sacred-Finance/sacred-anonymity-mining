import React, { memo } from 'react'
import _ from 'lodash'
import pluralize from 'pluralize'

export const StatsBadge = memo(
  ({
    label,
    value,
    icon,
    pluralizeLabel,
  }: {
    label?: string
    value?: string
    icon?: any
    pluralizeLabel?: boolean
  }) => (
    <div className="flex h-full cursor-auto items-center space-x-2 rounded-md bg-white p-1 px-2 text-sm text-gray-900 shadow-sm dark:bg-gray-800 dark:text-white">
      {label && (
        <span>
          {_.startCase(
            pluralizeLabel ? pluralize(label, Number(value)) : label
          )}
        </span>
      )}
      {icon}
      {value && <span>{value}</span>}
    </div>
  )
)
StatsBadge.displayName = 'StatsBadge'
