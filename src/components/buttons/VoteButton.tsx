import type { PrimaryButtonProps } from '@components/buttons/PrimaryButton'
import { PrimaryButton } from '@components/buttons/PrimaryButton'
import clsx from 'clsx'
import type { ReactNode } from 'react'
import { HandThumbDownIcon, HandThumbUpIcon } from '@heroicons/react/20/solid'

interface VoteButton {
  icon: React.ReactNode
  ariaLabel: string
  voteCount?: number
  className?: string
}

export const VoteUpButton = ({
  children,
  ...props
}: { props?: VoteButton; children: ReactNode } & PrimaryButtonProps) => (
  <PrimaryButton
    aria-label={'upvote'}
    {...props}
    requirements={{
      needsConnected: true,
      needsJoined: true,
    }}
    isConnected={props.isConnected}
    isJoined={props.isJoined}
    variant={'link'}
  >
    <div className={'flex items-center gap-2 '}>
      <HandThumbUpIcon
        className={clsx('border-1 w-6 p-1 group-hover:fill-green-300')}
        stroke={'#a49f9f'}
      />
      {children}
    </div>
  </PrimaryButton>
)
export const VoteDownButton = ({
  children,
  ...props
}: { props?: VoteButton; children: ReactNode } & PrimaryButtonProps) => (
  <PrimaryButton
    aria-label={'downvote'}
    {...props}
    requirements={{
      needsConnected: true,
      needsJoined: true,
    }}
    isConnected={props.isConnected}
    isJoined={props.isJoined}
    className={clsx(props.className)}
    variant={'link'}
  >
    <div className={'flex items-center gap-2 '}>
      <HandThumbDownIcon
        className={clsx('border-1  w-6 p-1 group-hover:fill-red-300')}
        stroke={'#a49f9f'}
      />
      {children}
    </div>
  </PrimaryButton>
)
