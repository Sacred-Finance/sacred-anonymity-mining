import type { PrimaryButtonProps } from '@components/buttons/PrimaryButton'
import { PrimaryButton } from '@components/buttons/PrimaryButton'
import clsx from 'clsx'
import type { ReactNode } from 'react'
import React from 'react'
import { HandThumbDownIcon, HandThumbUpIcon } from '@heroicons/react/20/solid'

interface VoteButton {
  icon: ReactNode
  ariaLabel: string
  voteCount?: number
  className?: string
}

export const VoteUpButton = ({
  children,
  ...props
}: { props?: VoteButton; children: ReactNode } & PrimaryButtonProps) => (
  <PrimaryButton
    loadingPosition="replace"
    aria-label="upvote"
    {...props}
    requirements={{
      needsConnected: true,
      needsJoined: true,
    }}
    isConnected={props.isConnected}
    isJoined={props.isJoined}
    className={clsx(props.className, 'group/like rounded-full p-0.5')}
    variant="ghost"
  >
    <span className="flex items-center gap-1 ">
      <HandThumbUpIcon
        className="w-6 stroke-blue-400 group-hover/like:scale-105 group-hover/like:fill-blue-400"
        strokeWidth={1.5}
      />
      {children}
    </span>
  </PrimaryButton>
)
export const VoteDownButton = ({
  children,
  ...props
}: { props?: VoteButton; children: ReactNode } & PrimaryButtonProps) => (
  <PrimaryButton
    loadingPosition="replace"
    aria-label="downvote"
    {...props}
    requirements={{
      needsConnected: true,
      needsJoined: true,
    }}
    isConnected={props.isConnected}
    isJoined={props.isJoined}
    className={clsx(props.className, 'group/dislike rounded-full  p-0.5')}
    variant="ghost"
  >
    <span className="flex items-center gap-1">
      <HandThumbDownIcon
        className="w-6 stroke-red-400 group-hover/dislike:scale-110 group-hover/dislike:fill-red-400"
        stroke="#a49f9f"
      />
      {children}
    </span>
  </PrimaryButton>
)
