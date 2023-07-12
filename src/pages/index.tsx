import HomePage from '../components/HomePage'
import WithStandardLayout from '@components/HOC/WithStandardLayout'

function Home() {
  return <HomePage isAdmin={false} />
}
export default WithStandardLayout(Home)
