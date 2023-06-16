import { useState } from 'react'
import { useAccount, useBalance, useNetwork, useSwitchNetwork } from 'wagmi'
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
      <CustomModal isOpen={createCommunityModalOpen}>
        <CreateGroupFormUI onCreate={createCommunity} onCreateGroupClose={() => setCreateCommunityModalOpen(false)} />
      </CustomModal>
      <div className={'flex h-full  flex-col justify-between overflow-y-auto'}>
        <Header createCommunity={() => setCreateCommunityModalOpen(true)} />
        <Main />
        <Footer />
      </div>
    </>
  )
}

function Main() {
  const createCommunity = useCreateCommunity(() => {})

  return <HomePage createCommunity={createCommunity} isAdmin={false} />
}
