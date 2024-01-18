import Community from '@/components/Discourse/Community'
import type { DiscourseCommunity } from '@/lib/model'
import { useGetDiscourseCommunities } from '@/hooks/discourse/useGetDiscourseCommunities'
import LoadingComponent from '../LoadingComponent'

const Communities = () => {
  const { data: communities, isValidating } = useGetDiscourseCommunities()

  if (!communities && isValidating) {
    return <LoadingComponent />
  }
  if (!communities) {
    return (
      <>
        <div className="col-span-full flex w-full flex-col items-center justify-center space-y-4">
          <h2 className="text-3xl font-semibold dark:text-gray-200 ">Oops, No Results Found</h2>
          <p className="px-4 text-center text-lg dark:text-gray-300">
            We could not find any communities at this time. Please try again later.
          </p>
        </div>
      </>
    )
  }
  return (
    <div className="m-5 grid grid-cols-2 gap-6 md:grid-cols-4">
      {communities?.map((c: DiscourseCommunity, i) => <Community key={`${c?.endpoint}_${i}`} {...c} />)}
    </div>
  )
}

export default Communities
