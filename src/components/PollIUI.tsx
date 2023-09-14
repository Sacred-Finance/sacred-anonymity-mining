import { forumContract } from '@/constant/const'
import React, { useEffect } from 'react'
import { getContent, getIpfsHashFromBytes32 } from '@/lib/utils'
import { PollType } from '@/lib/model'
import { PrimaryButton } from './buttons'
import { usePoll } from '@/hooks/usePoll'
import { toast } from 'react-toastify'
import { CircularLoader } from './JoinCommunityButton'
import clsx from 'clsx'

export const PollUI = ({ id, groupId, post }) => {
  const [answers, setAnswers] = React.useState([])
  const [results, setResults] = React.useState([])
  const [pollType, setPollType] = React.useState(PollType.SINGLE_ANSWER)
  const [pollExpiresAt, setPollExpiresAt] = React.useState(0)
  const [duration, setDuration] = React.useState(0) // in hours
  const [pollExpired, setPollExpired] = React.useState(true)
  const [answersToSubmit, setAnswersToSubmit] = React.useState([])
  const [range, setRange] = React.useState({ from: 0, to: 0 })
  const [isFetching, setIsFetching] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const { submitPoll } = usePoll({ groupId })
  useEffect(() => {
    fetchPollDetails()
  }, [id])

  const fetchPollDetails = async () => {
    setIsFetching(true)
    forumContract
      .pollAt(id)
      .then(async res => {
        console.log(res)
        const { answerCIDs, pollType, duration, startTime, answerCount, rateScaleFrom, rateScaleTo, results } = res
        const pollExpiration = (Number(startTime) + duration * 60 * 60) * 1000
        setDuration(duration)
        setPollExpiresAt(pollExpiration)
        setPollType(pollType)
        setPollExpired(pollExpiration < Date.now())
        setRange({ from: Number(rateScaleFrom), to: Number(rateScaleTo) })
        const answersFromIPFS = await Promise.all(
          answerCIDs.map(async cid => {
            return await getContent(getIpfsHashFromBytes32(cid))
          })
        )
        setAnswersToSubmit(new Array(Number(answerCount)).fill(0))
        setResults(() => {
          const emptyArray = new Array(Number(answerCount)).fill(0)
          results.forEach((result, index) => {
            emptyArray[index] = Number(result)
          })
          return emptyArray
        })
        setAnswers(answersFromIPFS)
      })
      .finally(() => {
        setIsFetching(false)
      })
  }

  const onSubmitPoll = () => {
    setIsLoading(true)
    submitPoll(
      id,
      answersToSubmit,
      async data => {
        console.log(data)
        await fetchPollDetails()
        setIsLoading(false)
        toast.success('Poll submitted successfully')
      },
      err => {
        setIsLoading(false)
        toast.error(err?.message ?? err)
      }
    )
  }

  const isVoteDisabled = () => {
    if (pollType == PollType.SINGLE_ANSWER || pollType == PollType.MULTI_ANSWER) {
      return !answersToSubmit.some(answer => answer >= 1)
    } else {
      return !answersToSubmit.every(answer => answer >= range.from && answer <= range.to)
    }
  }

  return (
    <React.Fragment>
      {isFetching ? (
        <CircularLoader className=" w-4 text-black" />
      ) : (
        <div className="justify-left flex flex-col justify-items-center">
          {pollType == PollType.SINGLE_ANSWER &&
            answers.map((answer, i) => (
              <div key={`${post.id}_${i}`} className="  inline-block min-h-[1.5rem] pl-[1.5rem]">
                <input
                  disabled={pollExpired}
                  className="checked:border-primary checked:after:border-primary checked:after:bg-primary checked:focus:border-primary dark:checked:border-primary dark:checked:after:border-primary dark:checked:after:bg-primary dark:checked:focus:border-primary relative float-left -   h-5 w-5 appearance-none rounded-full border-2 border-solid border-neutral-300 before:pointer-events-none before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:before:opacity-[0.16] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[0.625rem] checked:after:w-[0.625rem] checked:after:rounded-full checked:after:content-[''] checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:border-neutral-600 dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
                  type="radio"
                  id={`inlineRadioOptions_${post.id}_${i}`}
                  name={`inlineRadioOptions_${post.id}_${i}`}
                  checked={answersToSubmit[i] === 1}
                  onChange={() => {
                    setAnswersToSubmit(prev => {
                      const newAnswers = [...prev.fill(0)]
                      newAnswers[i] = 1
                      return [...newAnswers]
                    })
                  }}
                  value={answer}
                />
                <label className=" inline-block pl-[0.15rem] hover:cursor-pointer">
                  {answer} <span className="text-sm text-gray-500">{`(${Number(results[i])} Votes)`}</span>
                </label>
              </div>
            ))}

          {pollType == PollType.MULTI_ANSWER &&
            answers.map((answer, i) => (
              <div key={`${post.id}_${i}`} className="  inline-block min-h-[1.5rem] pl-[1.5rem]">
                <input
                  disabled={pollExpired}
                  className="checked:border-primary checked:bg-primary dark:checked:border-primary dark:checked:bg-primary relative float-left  h-[1.125rem] w-[1.125rem] appearance-none rounded-[0.25rem] border-[0.125rem] border-solid border-neutral-300 outline-none before:pointer-events-none before:absolute before:h-[0.875rem] before:w-[0.875rem] before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] checked:before:opacity-[0.16] checked:after:absolute checked:after:block checked:after:h-[0.8125rem] checked:after:w-[0.375rem] checked:after:rotate-45 checked:after:border-[0.125rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent checked:after:content-[''] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:transition-[border-color_0.2s] focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-[0.875rem] focus:after:w-[0.875rem] focus:after:rounded-[0.125rem] focus:after:content-[''] checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:after:h-[0.8125rem] checked:focus:after:w-[0.375rem] checked:focus:after:rotate-45 checked:focus:after:rounded-none checked:focus:after:border-[0.125rem] checked:focus:after:border-l-0 checked:focus:after:border-t-0 checked:focus:after:border-solid checked:focus:after:border-white checked:focus:after:bg-transparent dark:border-neutral-600 dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
                  type="checkbox"
                  id={`inlineCheckboxOptions_${post.id}_${i}`}
                  checked={answersToSubmit[i] === 1}
                  onChange={() => {
                    setAnswersToSubmit(prev => {
                      const newAnswers = [...prev]
                      newAnswers[i] = 1
                      return newAnswers
                    })
                  }}
                />
                <label className="inline-block pl-[0.15rem] hover:cursor-pointer">
                  {answer} <span className="text-sm text-gray-500">{`(${Number(results[i])} Votes)`}</span>{' '}
                </label>
              </div>
            ))}

          {pollType == PollType.NUMERIC_RATING &&
            answers.map((answer, i) => (
              <div key={`${post.id}_${i}`} className="text-md my-2 flex flex-row items-center gap-4 text-gray-900">
                <div className="w-80">
                  {answer} <span className="text-sm text-gray-500">{`(${Number(results[i])} Weightage)`}</span>
                </div>
                {!pollExpired && (
                  <input
                    disabled={pollExpired}
                    type="number"
                    min={range.from}
                    max={range.to}
                    onChange={e => {
                      setAnswersToSubmit(prev => {
                        const newAnswers = [...prev]
                        newAnswers[i] = e.target.value
                        return newAnswers
                      })
                    }}
                    placeholder={`Range: ${range.from} - ${range.to}`}
                    className="relative w-60 rounded border-0 bg-white px-2 py-1 text-sm text-slate-600 placeholder-slate-300 shadow outline-none focus:outline-none focus:ring"
                  />
                )}
              </div>
            ))}
          {!pollExpired && (
            <PrimaryButton
              className={clsx(
                'w-fit',
                'border-gray-500 border text-sm text-gray-500 transition-colors duration-150 hover:bg-gray-500 hover:text-white'
              )}
              type="button"
              isLoading={isLoading}
              onClick={onSubmitPoll}
              disabled={isVoteDisabled()}
            >
              Vote
            </PrimaryButton>
          )}
        </div>
      )}
    </React.Fragment>
  )
}
