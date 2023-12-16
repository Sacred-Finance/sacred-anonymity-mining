import React, { useCallback } from 'react'
import clsx from 'clsx'
import { PlusIcon, TrashIcon } from '@heroicons/react/20/solid'
import { PollType } from '@/lib/model'
import { usePoll } from '@/hooks/usePoll'
import { toast } from 'react-toastify'
import { PrimaryButton } from './buttons'
import dynamic from 'next/dynamic'
import { debounce } from 'lodash'
import type { OutputData } from '@editorjs/editorjs'
import type { Group, Item } from '@/types/contract/ForumInterface'
import { useAccount } from 'wagmi'
import { ScrollArea } from '@/shad/ui/scroll-area'
import { Button } from '@/shad/ui/button'

const Editor = dynamic(() => import('./editor-js/Editor'), {
  ssr: false,
})

interface CreatePollUIProps {
  group: Group
  post?: Item
  onSuccess?: () => void
}

const CreatePollUI = ({ post, group, onSuccess }: CreatePollUIProps) => {
  const [showModal, setShowModal] = React.useState(false)
  const [title, setTitle] = React.useState('Do you like this poll?')
  const [description, setDescription] = React.useState<
    typeof OutputData | null
  >(null)
  const [pollType, setPollType] = React.useState(0)
  const [duration, setDuration] = React.useState(168)
  const [rateScaleFrom, setRateScaleFrom] = React.useState(0)
  const [rateScaleTo, setRateScaleTo] = React.useState(0)

  const [options, setOptions] = React.useState(['Yes', 'No'])
  const [loading, setLoading] = React.useState(false)

  const { address } = useAccount()

  const { createPoll } = usePoll({
    group,
  })

  const pollTypes = [
    {
      name: PollType.SINGLE_ANSWER.toString(),
      label: 'Single Answer',
      value: 0,
    },
    {
      name: PollType.MULTI_ANSWER.toString(),
      label: 'Multi Answer',
      value: 1,
    },
    {
      name: PollType.NUMERIC_RATING.toString(),
      label: 'Numeric Rating',
      value: 2,
    },
  ]

  const submit = async () => {
    if (!address) {
      toast.error('Please connect your wallet')
      return
    }
    setLoading(true)
    try {
      await createPoll({
        post: post,
        group: group,
        pollType: pollType,
        duration: duration,
        options: options,
        answers: options,
        rateScaleFrom: rateScaleFrom,
        rateScaleTo: rateScaleTo,
        content: {
          title: title,
          description: description,
        },
        onSuccessCallback: () => {
          toast.success('Poll created successfully')
          setLoading(false)
          setShowModal(false)
          onSuccess && onSuccess()
        },
        onErrorCallback: err => {
          console.log(err)
          setShowModal(false)
          toast.error(err?.message ?? err)
          setLoading(false)
        },
      })
    } catch (error) {
      toast.error(error?.message ?? error)

      setLoading(false)
    }
  }
  const debouncedSetDescription = useCallback(debounce(setDescription, 300), [])

  const disableSave = () => {
    if (!title || !duration || options.some(option => !option)) {
      return true
    }
  }
  return (
    <>
      <PrimaryButton type="button" onClick={() => setShowModal(true)}>
        Create Poll
      </PrimaryButton>
      {showModal ? (
        <>
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none">
            <div className="relative  w-full md:w-[70%] md:max-w-6xl">
              {/*content*/}
              <div className="relative flex w-full flex-col rounded border-0 bg-white shadow-lg outline-none focus:outline-none dark:bg-gray-800">
                {/*header*/}
                <div className="flex items-start justify-between rounded-t border-b border-solid border-slate-200 p-5 dark:border-gray-600">
                  <h3 className="text-3xl font-semibold">Create Poll</h3>
                  <Button
                    className="float-right  border-0 bg-transparent p-1 text-3xl font-semibold leading-none text-black opacity-5 outline-none focus:outline-none"
                    onClick={() => setShowModal(false)}
                  >
                    <span className="block h-6 w-6 bg-transparent text-2xl text-black opacity-5 outline-none focus:outline-none">
                      ×
                    </span>
                  </Button>
                </div>
                {/*body*/}
                <div className="relative flex flex-col gap-4 p-6">
                  {/* PollType */}
                  <div className="justify-left flex gap-4">
                    {pollTypes.map((i, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          className="relative float-left h-5 w-5 appearance-none rounded-full border-2 border-solid border-neutral-300 before:pointer-events-none  before:absolute before:h-4 before:w-4 before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] after:absolute after:z-[1] after:block after:h-4 after:w-4 after:rounded-full after:content-[''] checked:border-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:h-[0.625rem] checked:after:w-[0.625rem] checked:after:rounded-full checked:after:border-primary checked:after:bg-primary checked:after:content-[''] checked:after:[transform:translate(-50%,-50%)] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:border-primary checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:border-neutral-600 dark:checked:border-primary dark:checked:after:border-primary dark:checked:after:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:border-primary dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
                          type="radio"
                          name={`POLL_TYPE`}
                          checked={i.value === pollType}
                          onChange={() => setPollType(i.value)}
                          id={`${i.value}`}
                          value={i.value}
                        />
                        <label
                          htmlFor={`${i.value}`}
                          className="inline-block pl-[0.15rem] hover:cursor-pointer"
                        >
                          {i.label}
                        </label>
                      </div>
                    ))}
                  </div>

                  {/* Title */}
                  <div className="flex w-full flex-col gap-2">
                    <label htmlFor={'title'} className="text-base">
                      Title (Max 60)
                    </label>
                    <input
                      //highlight on click
                      className=" w-full  rounded border border-gray-400 px-3 py-2 focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-700"
                      onClick={e => e.currentTarget.select()}
                      maxLength={60}
                      placeholder={'Poll Title'}
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                    />
                  </div>

                  <ScrollArea className="flex max-h-[calc(35vh)] w-full flex-col gap-2 ">
                    <label htmlFor={'content'} className="text-base">
                      Content
                    </label>
                    <Editor
                      divProps={{
                        className: clsx(
                          'z-50 mt-2 h-full w-full overflow-y-visible rounded-md bg-white text-black shadow-md dark:border-gray-600 dark:bg-gray-700'
                        ),
                      }}
                      data={description}
                      onChange={debouncedSetDescription}
                      readOnly={false}
                      placeholder={'Poll Description'}
                      holder={`create-poll`}
                    />
                  </ScrollArea>

                  {/* Rate Scale */}
                  {pollType == PollType.NUMERIC_RATING && (
                    <div className="flex flex-row gap-4">
                      <div className="flex w-full flex-col gap-4">
                        <div className="text-base">Rate Scale From</div>
                        <input
                          className=" w-full  rounded border border-gray-400 px-3 py-2 focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-700"
                          placeholder={'Rate Scale From'}
                          type="number"
                          value={rateScaleFrom}
                          onChange={e => setRateScaleFrom(+e.target.value)}
                        />
                      </div>
                      <div className="flex w-full flex-col gap-4">
                        <div className="text-base">Rate Scale To</div>
                        <input
                          className=" w-full  rounded border border-gray-400 px-3 py-2 focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-700"
                          placeholder={'Rate Scale To'}
                          type="number"
                          value={rateScaleTo}
                          onChange={e => setRateScaleTo(+e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Options */}
                  <div className="flex w-full flex-col gap-4">
                    <div className="text-base">
                      Options (Minimum 2, Maximum 10)
                    </div>
                    <div className="flex flex-col gap-4">
                      {options.map((option, index) => (
                        <div className="flex items-center gap-2" key={index}>
                          <input
                            tabIndex={index}
                            className=" w-full  rounded border border-gray-400 px-3 py-2 focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-700"
                            placeholder={'Option'}
                            type="text"
                            value={option}
                            onChange={e => {
                              const newOptions = [...options]
                              newOptions[index] = e.target.value
                              setOptions(newOptions)
                            }}
                          />

                          <button
                            onClick={() => {
                              const newOptions = [...options]
                              newOptions.splice(index, 1)
                              setOptions(newOptions)
                            }}
                            disabled={options.length <= 2}
                            className="rounded border border-pink-500  p-2 text-xs font-bold uppercase text-red-500 outline-none transition-all duration-150 ease-linear hover:bg-red-500 hover:text-white focus:outline-none active:bg-red-600 disabled:cursor-not-allowed disabled:opacity-25"
                            type="button"
                          >
                            <TrashIcon width={20} />
                          </button>

                          <button
                            onClick={() => {
                              const newOptions = [...options]
                              newOptions.push('')
                              setOptions(newOptions)
                            }}
                            disabled={
                              options.length >= 10 ||
                              index !== options.length - 1
                            }
                            className={clsx(
                              'mr-1 rounded border border-pink-500 p-2 text-xs font-bold uppercase text-gray-500 outline-none transition-all duration-150 ease-linear last:mr-0 hover:bg-gray-500 hover:text-white focus:outline-none active:bg-gray-600',
                              options.length >= 10 ||
                                index !== options.length - 1
                                ? 'invisible'
                                : 'bg-green-500/90 text-white'
                            )}
                            type="button"
                          >
                            <PlusIcon width={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex w-full flex-col gap-4">
                    <div className="text-base">Duration (In Hours)</div>
                    <input
                      className=" w-full  rounded border border-gray-400 px-3 py-2 focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-700"
                      placeholder={'In Hours, 1 Week = 168 Hours'}
                      type="number"
                      value={duration}
                      onChange={e => setDuration(+e.target.value)}
                    />
                  </div>
                </div>

                {/*footer*/}
                <div className="flex items-center justify-end rounded-b border-t border-solid border-slate-200 p-6 dark:border-gray-600">
                  <button
                    className="background-transparent   px-6 py-2 text-sm font-bold uppercase text-red-500 outline-none transition-all duration-150 ease-linear focus:outline-none"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                  <PrimaryButton
                    className="rounded bg-green-500 p-3 text-white transition-colors duration-150 hover:bg-green-600"
                    type="button"
                    onClick={() => submit()}
                    isLoading={loading}
                    disabled={loading || disableSave()}
                  >
                    Create Poll
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </div>
          <div className="fixed inset-0 z-40 bg-black opacity-25"></div>
        </>
      ) : null}
    </>
  )
}

export default CreatePollUI
