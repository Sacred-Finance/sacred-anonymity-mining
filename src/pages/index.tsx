import { BigNumber } from 'ethers'
import WithStandardLayout from '@components/HOC/WithStandardLayout'
import HomePage from '../components/HomePage'
import axios from 'axios'

function Home({ communitiesData, users, discourseCommunities }) {
  return (
    <HomePage
      isAdmin={false}
      communities={communitiesData.map(c => ({ ...c, id: BigNumber.from(c.id) }))}
      discourseCommunities={discourseCommunities}
    />
  )
}

export const getServerSideProps = async () => {
  const data = await axios.get(
    process.env.NEXT_PUBLIC_DISCOURSE_GOOGLE_SHEET_API_URL
  )
  console.log(data)
  return {
    props: {
      discourseCommunities: data.data?.communities,
    },
  }
}

export default WithStandardLayout(Home)
