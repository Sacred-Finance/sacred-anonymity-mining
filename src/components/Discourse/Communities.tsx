import Community from '@/components/Discourse/Community'
import type { DiscourseCommunity } from '@/lib/model'

const Communities = ({
  communities,
}: {
  communities?: DiscourseCommunity[]
}) => {
  return (
    <div className="m-5 grid grid-cols-2 gap-6 md:grid-cols-4">
      {communities?.map((c: DiscourseCommunity, i) => (
        <Community key={`${c?.endpoint}_${i}`} {...c} />
      ))}
    </div>
  )
}

export default Communities
