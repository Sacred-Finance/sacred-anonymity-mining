import React, { useEffect, useState } from 'react'
import { Identity } from '@semaphore-protocol/identity'
import { UnirepUser } from '@/lib/unirep'

// Dummy identity, replace with real identity when available

// Tailwind CSS for simplicity
const CardStyle = 'border border-blue-500 shadow rounded-md p-4 max-w-sm w-full mx-auto'
const DataTitleStyle = 'text-blue-500 text-left font-bold text-lg'
const DataStyle = 'text-gray-800 text-left text-sm'

const ReputationCard = ({ unirepUser }) => {
  const [reputation, setReputation] = useState({
    posRep: 0,
    negRep: 0,
    graffiti: 0,
    timestamp: 0,
  })

  useEffect(() => {
    const fetchReputation = async () => {
      console.log('unirepUser', unirepUser)
      const rep = await unirepUser?.fetchReputation?.()

        console.log('rep',rep)
      setReputation(rep)
    }

    fetchReputation()
  }, [])

  if (!reputation) return <div></div>
  return (
    <div className={CardStyle}>
      <h2 className={DataTitleStyle}>Your Reputation</h2>
      <p className={DataStyle}>Positive Rep: {reputation.posRep}</p>
      <p className={DataStyle}>Negative Rep: {reputation.negRep}</p>
      <p className={DataStyle}>Graffiti: {reputation.graffiti}</p>
      <p className={DataStyle}>Timestamp: {new Date(reputation.timestamp * 1000).toLocaleString()}</p>
    </div>
  )
}

export default ReputationCard
