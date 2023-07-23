import { BigNumber } from 'ethers'
import WithStandardLayout from '@components/HOC/WithStandardLayout'
import HomePage from '../components/HomePage'

function Home({ communitiesData, users }) {
  return (
    <HomePage
      isAdmin={false}
      communities={communitiesData.map(c => ({ ...c, id: BigNumber.from(c.id) }))}
      users={users}
    />
  )
}

export default WithStandardLayout(Home)
