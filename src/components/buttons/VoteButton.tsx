import { DownVoteIcon, UpVoteIcon } from '@/constant/icons'
import { CircularLoader } from '@components/JoinCommunityButton'

const VoteButton = ({ icon, ariaLabel, voteCount, isLoading, ...props }) => {
  return (
    <button
      aria-label={ariaLabel}
      {...props}
      className={`rounded border border-black px-2 py-2 text-sm hover:bg-gray-400 hover:dark:bg-purple-100 ${props.className}`}
    >
      {isLoading ? (
        <span className="text-primary-500">
          <CircularLoader className={'h-6 w-6'} />
        </span>
      ) : (
        icon
      )}
      <span className="text-sm">{voteCount}</span>
    </button>
  )
}

export const VoteUpButton = props => (
  <VoteButton icon={<UpVoteIcon fill={'#4CAF50'} stroke={'#4CAF50'} />} ariaLabel="upvote" {...props} />
)
export const VoteDownButton = props => (
  <VoteButton icon={<DownVoteIcon fill={'#4CAF50'} stroke={'#4CAF50'} />} ariaLabel="downvote" {...props} />
)
