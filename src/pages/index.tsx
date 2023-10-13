import { BigNumber } from 'ethers'
import HomePage from '../components/HomePage'
import axios from 'axios'

function Home({ communitiesData, users, discourseCommunities }) {
  if (!communitiesData || !users) return null
  return (
    <HomePage
      isAdmin={false}
      communities={communitiesData.map(c => ({ ...c, id: BigNumber.from(c.id) }))}
      discourseCommunities={discourseCommunities}
      users={users}
    />
  )
}

export const getServerSideProps = async () => {
  const data = await axios.get(
    process.env.NEXT_PUBLIC_DISCOURSE_GOOGLE_SHEET_API_URL as string
  )
  return {
    props: {
      discourseCommunities: data.data?.communities,
    },
  }
}

export default (Home)
