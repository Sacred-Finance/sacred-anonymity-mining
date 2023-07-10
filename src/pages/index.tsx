import Header from '../components/Header'
import HomePage from '../components/HomePage'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <>
      <div className={' flex h-screen flex-col'}>
        <Header />
        <div>
          <HomePage isAdmin={false} />
        </div>
        <div className={'flex-1  '} />
        <div className={'relative'}>
          <Footer />
        </div>
      </div>
    </>
  )
}
