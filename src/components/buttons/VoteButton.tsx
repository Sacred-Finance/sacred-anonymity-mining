import { DownVoteIcon, UpVoteIcon } from '@/constant/icons'
import { CircularLoader } from '@components/JoinCommunityButton'
import { PrimaryButton, PrimaryButtonProps } from '@components/buttons/PrimaryButton'
import clsx from 'clsx'

interface VoteButton {
  icon: React.ReactNode
  ariaLabel: string
  voteCount?: number
  className?: string
}

const voteButtonClass = 'h-8 w-8 hover:border !gap-0 relative text-xl  !p-1 hover:bg-gray-50  bg-white'
export const VoteUpButton = ({ ...props }: { props?: VoteButton } & PrimaryButtonProps) => (
  <PrimaryButton
    aria-label={'upvote'}
    {...props}
    requirements={{
      needsConnected: true,
      needsJoined: true,
    }}
    isConnected={props.isConnected}
    isJoined={props.isJoined}
    className={clsx(voteButtonClass, props.className)}
  >
    <UpVoteIcon
      className={clsx(
        'absolute left-1/2 top-1/2',
        '-translate-x-1/2 -translate-y-1/2 transform',
        props.isLoading ? 'opacity-0' : 'opacity-100'
      )}
      fill={'#4CAF50'}
      stroke={'#a49f9f'}
    />
  </PrimaryButton>
)
export const VoteDownButton = ({ ...props }: { props?: VoteButton } & PrimaryButtonProps) => (
  <PrimaryButton
    aria-label={'downvote'}
    {...props}
    requirements={{
      needsConnected: true,
      needsJoined: true,
    }}
    isConnected={props.isConnected}
    isJoined={props.isJoined}
    className={clsx(voteButtonClass, props.className)}
  >
    <DownVoteIcon
      className={clsx(
        'absolute left-1/2 top-1/2',
        '-translate-x-1/2 -translate-y-1/2 transform',
        props.isLoading ? 'opacity-0' : 'opacity-100'
      )}
      fill={'#d51221'}
      stroke={'#a49f9f'}
    />
  </PrimaryButton>
)
