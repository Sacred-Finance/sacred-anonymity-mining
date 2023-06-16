import { motion } from 'framer-motion'
import React, { useState } from 'react'
import { DownVoteIcon, UpVoteIcon } from '../../constant/icons'
import clsx from 'clsx'

const MotionButton = motion.button

const VoteButton = ({ icon, ariaLabel, voteCount, ...props }) => {
  return (
    <button
      aria-label={ariaLabel}
      {...props}
      className={clsx(
        'rounded border border-black px-2 py-2 text-sm hover:bg-gray-900 hover:dark:bg-purple-100',
        props.className
      )}
    >
      {React.cloneElement(icon, { width: 20, height: 20 })}
      <span className="text-sm">{voteCount}</span>
    </button>
  )
}

// Higher Order Components
const withVoteUpButton = Component => {
  const WithVoteUpButtonComponent = props => {
    return <Component icon={<UpVoteIcon fill={'#4CAF50'} stroke={'#4CAF50'} />} ariaLabel="upvote" {...props} />
  }

  WithVoteUpButtonComponent.displayName = `WithVoteUpButton(${getDisplayName(Component)})`

  return WithVoteUpButtonComponent
}

function getDisplayName(Component) {
  return Component.displayName || Component.name || 'Component'
}

const withVoteDownButton = Component => {
  const WithVoteDownButtonComponent = props => {
    return <Component icon={<DownVoteIcon fill={'#4CAF50'} stroke={'#4CAF50'} />} ariaLabel="downvote" {...props} />
  }

  WithVoteDownButtonComponent.displayName = `WithVoteDownButton(${getDisplayName(Component)})`

  return WithVoteDownButtonComponent
}

export const VoteUpButton = withVoteUpButton(VoteButton)
export const VoteDownButton = withVoteDownButton(VoteButton)

// display name
VoteButton.displayName = 'VoteButton'
