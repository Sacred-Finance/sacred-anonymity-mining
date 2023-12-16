import type { DiscourseCommunity } from '@/lib/model'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useFetchMetadata } from '@/hooks/discourse/useFetchMetadata'
import { CircularLoader } from '../buttons/JoinCommunityButton'

const Community = ({
  apiKey,
  username,
  endpoint,
  id,
  readonly,
}: DiscourseCommunity) => {
  const router = useRouter()
  const { groupId } = router.query
  const { community, loading } = useFetchMetadata(id)

  return (
    <>
      <Link href={`/discourse/${id}`}>
        {loading ? (
          <CircularLoader className="m-auto h-8 w-8" />
        ) : (
          <>
            <div className="max-w-sm rounded-lg border border-gray-200 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
              <div className="relative">
                {Boolean(+readonly) && (
                  <div className="absolute right-0 mt-1 flex">
                    <span className="border-r-1 ml-auto mr-1 rounded border border-gray-500 bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-400">
                      Readonly
                    </span>
                  </div>
                )}
                <img className="rounded-t-lg" src={community?.image} alt="" />
                <div className="p-5">
                  <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {community?.name}
                  </h5>
                  <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                    {community?.description}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </Link>
    </>
  )
}

export default Community
