import React from 'react'

interface SummaryButtonProps {
  postData: string
  postTitle?: string
}

const SummaryButton: React.FC<SummaryButtonProps> = ({
  postData,
  postTitle,
}) => {
  return <></>
  // const [
  //   { isLoading, data, error, fetchData },
  // ]  = useGPTServerAnalysis({ postData, template: Template.Summarize })
  // const [showModal, setShowModal] = React.useState(false)
  //
  // const toggleModal = () => {
  //   setShowModal(!showModal)
  // }
  //
  // React.useEffect(() => {
  //   if (data) {
  //     setShowModal(true)
  //   }
  // }, [data])
  //
  // // if isLoading we want to have a confirmation if the user tries to leave the page
  // // if the user tries to leave the page we want to show a confirmation
  //
  // useEffect(() => {
  //   if (isLoading) {
  //     window.onbeforeunload = () => true
  //   } else {
  //     window.onbeforeunload = undefined
  //   }
  // }, [isLoading])
  //
  // return (
  //   <div
  //     className="relative w-fit"
  //     onClick={() => {
  //       if (showModal) {
  //         toggleModal()
  //       }
  //     }}
  //   >
  //     <PrimaryButton
  //       onClick={data ? toggleModal : fetchData}
  //       disabled={isLoading || postData.length < 25}
  //       title={postData.length < 25 ? 'Post content too short to summarize' : data ? 'View summary' : 'Summarize post'}
  //       endIcon={<SparklesIcon className={clsx('h-5 w-5', data ? 'text-white' : 'text-gray-500')} height={20} />}
  //       isLoading={isLoading}
  //       variant={'outline'}
  //     >
  //       {data ? 'Summary' : 'Summarize'}
  //     </PrimaryButton>
  //
  //     {showModal && (
  //       <div className="fixed inset-0 z-[51] flex items-center justify-center bg-black bg-opacity-50">
  //         <div
  //           className="200 relative w-1/2 overflow-y-auto rounded bg-white p-8 text-center dark:bg-gray-600"
  //           onClick={e => {
  //             e.stopPropagation()
  //           }}
  //         >
  //           <Button variant={'destructive'} onClick={toggleModal}>
  //             Close
  //           </Button>
  //           <span className={'text-xl font-bold '}>{!postTitle ? 'Summary' : postTitle}</span>
  //           <br />
  //           <br />
  //           {error && (
  //             <>
  //               <div className="text-red-500">{error}</div>
  //               <div className="text-gray-500">Please try again later.</div>
  //             </>
  //           )}
  //           <EditorJsRenderer data={data ? data.html : 'Loading summary...'} isHtml={true} />
  //         </div>
  //       </div>
  //     )}
  //   </div>
  // )
}

export default SummaryButton
