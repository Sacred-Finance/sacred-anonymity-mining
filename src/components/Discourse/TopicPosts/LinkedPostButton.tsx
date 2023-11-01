import React from 'react'
import { StatsBadge } from '@components/Discourse/TopicPosts/StatsBadge'

export const LinkedPostButton = ({
  postNumber,
  setTargetPostNumber,
  icon,
}: {
  postNumber: number
  setTargetPostNumber: React.Dispatch<React.SetStateAction<number | null>>
  icon?: any
}) => (
  <button
    className="flex rounded border p-2 text-xs hover:bg-gray-700 hover:text-white"
    onClick={() => {
      setTargetPostNumber(postNumber)
    }}
  >
    <StatsBadge value={postNumber} />
    {icon}
  </button>
)
