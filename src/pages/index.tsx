import { BigNumber } from 'ethers'
import HomePage from '../components/HomePage'

function Home({ communitiesData, users }) {
  if (!communitiesData || !users) return null
  return (
    <HomePage
      isAdmin={false}
      communities={communitiesData.map(c => ({ ...c, id: BigNumber.from(c.id) }))}
    />
  )
}

export default (Home)
