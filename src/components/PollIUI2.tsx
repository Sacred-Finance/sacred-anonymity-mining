import React, { useEffect, useState } from 'react'
import { forumContract } from '@/constant/const'
import { getContent, getIpfsHashFromBytes32 } from '@/lib/utils'
import { PollType } from '@/lib/model'
import { PrimaryButton } from './buttons'
import { usePoll } from '@/hooks/usePoll'
import { toast } from 'react-toastify'
import clsx from 'clsx'
import type { Group, Item } from '@/types/contract/ForumInterface'
import { fromHex, hexToNumber, isHex } from 'viem'
import { CircularLoader } from '@components/buttons/JoinCommunityButton'

const VoteIndicator = ({ progress }: { progress: number }) => (
  <div className="my-auto h-3 w-[90%] bg-neutral-200 dark:bg-neutral-600 rounded-full overflow-hidden shadow">
    <div
      style={{ width: `${progress}%` }}
      className="h-full rounded-full bg-primary transition-all duration-500 ease-in-out"
    ></div>
  </div>
)

const PollAnswer = ({
  type,
  answer,
  i,
  post,
  results,
  totalVotes,
  setAnswersToSubmit,
  pollExpired,
  range,
}: {
  type: string
  answer: string
  i: number
  post: Item
  results: number[]
  totalVotes: number
  setAnswersToSubmit: (
    answers: number[] | ((prevAnswers: number[]) => number[])
  ) => void | ((prevAnswers: number[]) => number[])

  pollExpired: boolean
  range: { from: number; to: number }
}) => {
  const handleInputChange = (type, i, value) => {
    setAnswersToSubmit((prev: any) => {
      const newAnswers = [...prev]
      if (type === 'radio') {
        return newAnswers.fill(0).map((_, idx) => (idx === i ? 1 : 0))
      } else if (type === 'checkbox') {
        newAnswers[i] = newAnswers[i] === 1 ? 0 : 1
      } else {
        newAnswers[i] = value
      }
      return newAnswers
    })
  }

  return (
    <div key={`${post.id}_${i}`} className="mb-1 mr-4 min-h-6">
      <div className="flex flex-row">
        <label className="w-11/12">{answer}</label>
        <label className="w-1/12 text-end">
          <span className="text-sm font-bold text-gray-500">
            {Number(results[i])}
          </span>
        </label>
      </div>
      <div className="flex flex-row gap-2">
        <VoteIndicator
          progress={results[i] ? (results[i] / totalVotes) * 100 : 0}
        />
        <InputField
          type={type}
          index={i}
          post={post}
          pollExpired={pollExpired}
          range={range}
          onChange={handleInputChange}
        />
      </div>
    </div>
  )
}

const InputField = ({
  type,
  index,
  post,
  pollExpired,
  range,
  onChange,
}: {
  type: string
  index: number
  post: Item
  pollExpired: boolean
  range: { from: number; to: number }
  onChange: (type: string, index: number, value?: number | string) => void
}) => {
  const inputName = `input_${post.id}_${index}`
  if (type === 'radio') {
    return (
      <input
        type="radio"
        id={inputName}
        name={`radioOptions_${post.id}`}
        disabled={pollExpired}
        onChange={() => onChange('radio', index)}
        className="focus:ring-primary-dark rounded bg-gray-100 p-4 text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400"
      />
    )
  } else if (type === 'checkbox') {
    return (
      <input
        type="checkbox"
        id={inputName}
        name={`checkboxOptions_${post.id}`}
        disabled={pollExpired}
        onChange={() => onChange('checkbox', index)}
        className=" focus:ring-primary-dark rounded bg-gray-100 p-4 text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400"
      />
    )
  } else if (type === 'number') {
    return (
      <input
        type="number"
        id={inputName}
        min={range.from}
        max={range.to}
        disabled={pollExpired}
        onChange={e => onChange('number', index, e.target.value)}
        className=" focus:ring-primary-dark rounded bg-gray-100 p-4 text-black s placeholder:text-gray-500 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400"
        placeholder={`${range.from} - ${range.to}`}
      />
    )
  }
  return null
}

export const PollUI = ({ group, post }: { group: Group; post: Item }) => {
  const [answers, setAnswers] = React.useState([])
  const [results, setResults] = React.useState([])
  const [totalVotes, setTotalVotes] = React.useState(0)
  const [pollType, setPollType] = React.useState(PollType.SINGLE_ANSWER)
  const [pollExpiresAt, setPollExpiresAt] = React.useState(0)
  const [duration, setDuration] = React.useState(0) // in hours
  const [pollExpired, setPollExpired] = React.useState(true)
  const [answersToSubmit, setAnswersToSubmit] = React.useState<number[]>([])
  const [range, setRange] = React.useState<
    { from: number; to: number } | undefined
  >({ from: 0, to: 0 })
  const [isFetching, setIsFetching] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const { submitPoll } = usePoll({ group })

  const id = post.id

  useEffect(() => {
    fetchPollDetails()
  }, [id])

  type PollResponse = {
    answerCIDs: `0x${string}`[]
    pollType: PollType // Assuming PollType is an enum or type
    duration: bigint // Assuming these are initially strings
    startTime: bigint
    answerCount: bigint
    rateScaleFrom: bigint
    rateScaleTo: bigint
    results: string[]
  }

  const fetchPollDetails = async () => {
    setIsFetching(true)

    try {
      const res: PollResponse = await forumContract.read.pollAt([BigInt(id)])

      const answerCount = res.answerCount.toString()
      const duration = res.duration.toString()
      const startTime = res.startTime.toString()
      const rateScaleFrom = res.rateScaleFrom.toString()
      const rateScaleTo = res.rateScaleTo.toString()
      const results = res.results.map(result => result.toString())

      const pollExpiration = (Number(startTime) + duration * 60 * 60) * 1000
      setDuration(duration)
      setPollExpiresAt(pollExpiration)
      setPollType(res.pollType)
      setPollExpired(pollExpiration < Date.now())
      setRange({ from: Number(rateScaleFrom), to: Number(rateScaleTo) })

      const answersFromIPFS = await Promise.all(
        res.answerCIDs.map(cid => getContent(getIpfsHashFromBytes32(cid)))
      )

      setAnswersToSubmit(new Array(answerCount).fill(0) as unknown as number[])
      setResults(() => {
        const emptyArray = new Array(answerCount).fill(0)
        results.forEach((result, index) => {
          emptyArray[index] = result
        })
        if (emptyArray.length) {
          setTotalVotes(emptyArray.reduce((a, b) => a + b, 0))
        }
        return emptyArray
      })

      setAnswers(answersFromIPFS)
    } catch (error) {
      console.error('Error fetching poll details:', error)
      // Handle the error appropriately
    } finally {
      setIsFetching(false)
    }
  }

  const onSubmitPoll = async () => {
    setIsLoading(true)
    await submitPoll({
      id,
      pollData: answersToSubmit,
      onErrorCallback: err => {
        setIsLoading(false)
        toast.error(err?.message ?? err)
      },
      onSuccessCallback: async data => {
        console.log(data)
        await fetchPollDetails()
        setIsLoading(false)
        toast.success('Poll submitted successfully')
      },
    })
  }

  const isVoteDisabled = () => {
    if (
      pollType == PollType.SINGLE_ANSWER ||
      pollType == PollType.MULTI_ANSWER
    ) {
      return !answersToSubmit.some(answer => answer >= 1)
    } else {
      return !answersToSubmit.every(
        answer => answer >= range.from && answer <= range.to
      )
    }
  }

  const VoteIndicator = ({ progress }) => {
    return (
      <div className="my-auto h-1 w-[90%] bg-neutral-200 dark:bg-neutral-600">
        <div
          style={{ width: `${progress}%` }}
          className={clsx(`h-1 bg-primary`)}
        ></div>
      </div>
    )
  }

  return (
    <React.Fragment>
      {isFetching ? (
        <CircularLoader className="m-auto mt-3 w-4 text-black" />
      ) : (
        <div className="justify-left flex flex-col justify-items-center">
          {answers.map((answer, i) => (
            <PollAnswer
              type={getInputType(pollType)}
              answer={answer}
              i={i}
              post={post}
              results={results}
              totalVotes={totalVotes}
              setAnswersToSubmit={setAnswersToSubmit}
              pollExpired={pollExpired}
              range={range}
            />
          ))}
          <PrimaryButton
            className={clsx(
              'my-2 w-fit',
              'border border-gray-500 text-sm text-slate-200 transition-colors duration-150 hover:bg-gray-500 hover:text-white dark:text-slate-200'
            )}
            type="button"
            isLoading={isLoading}
            onClick={onSubmitPoll}
            disabled={isVoteDisabled() || pollExpired}
          >
            {pollExpired ? 'Poll Expired' : 'Vote'}
          </PrimaryButton>
        </div>
      )}
    </React.Fragment>
  )
}

const getInputType = pollType => {
  switch (pollType) {
    case PollType.SINGLE_ANSWER:
      return 'radio'
    case PollType.MULTI_ANSWER:
      return 'checkbox'
    case PollType.NUMERIC_RATING:
      return 'number'
    default:
      // Define a default case if needed, e.g., 'radio' or return null
      return 'radio'
  }
}
