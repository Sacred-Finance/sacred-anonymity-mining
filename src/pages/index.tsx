import { useState } from 'react'
import Header from '../components/Header'
import HomePage from '../components/HomePage'
import Footer from '../components/Footer'
import { useCreateCommunity } from '../hooks/useCreateCommunity'
import CreateGroupFormUI from '../components/CreateGroupFormUI'
import { CustomModal } from '../components/CustomModal'

export default function Home() {
  const createCommunity = useCreateCommunity(() => {})

  const [createCommunityModalOpen, setCreateCommunityModalOpen] = useState(false)

  return (
    <>
      <CustomModal isOpen={createCommunityModalOpen} setIsOpen={setCreateCommunityModalOpen}>
        <CreateGroupFormUI onCreate={createCommunity} onCreateGroupClose={() => setCreateCommunityModalOpen(false)} />
      </CustomModal>
      <div className={' flex h-screen flex-col'}>
        <Header createCommunity={() => setCreateCommunityModalOpen(true)} />
        <div>
          {' '}
          <Main />
        </div>
        <div className={'flex-1  '} />
        <div className={'relative'}>
          <Footer />
        </div>
      </div>
    </>
  )
}

function Main() {
  const createCommunity = useCreateCommunity(() => {})

  return <HomePage createCommunity={createCommunity} isAdmin={false} />
}
