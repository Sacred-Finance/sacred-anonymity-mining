// syncing component will be small text sitting at the bottom of the page with a blinking dot
import React from 'react'

export const Syncing = () => {
  return (
    <div className="text-md fixed bottom-0 right-0 p-2 text-gray-400">
      <span>Syncing</span>
      <span className="animate-ping">.</span>
      <span className="animate-ping">.</span>
      <span className="animate-ping">.</span>
    </div>
  )
}
