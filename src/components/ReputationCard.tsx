import React, { useEffect, useState } from 'react'
import { Identity } from '@semaphore-protocol/identity'
import { UnirepUser } from '@/lib/unirep'

// Dummy identity, replace with real identity when available

// Tailwind CSS for simplicity
const CardStyle = 'border border-blue-500 shadow rounded-md p-4   bg-white'
const DataTitleStyle = 'text-blue-500 text-left font-bold text-lg'
const DataStyle = 'text-gray-800 text-left text-sm'

const ReputationCard = ({ unirepUser }) => {
  const [reputation, setReputation] = useState({
    posRep: 0,
    negRep: 0,
    graffiti: 0,
    timestamp: 0,
  })

  const updateReputation = React.useCallback(async () => {
      console.log('unirepUser?.reputation', unirepUser?.reputation)
    if (unirepUser?.reputation?.posRep !== undefined) setReputation(unirepUser.reputation)
  }, [unirepUser])

  useEffect(() => {
    updateReputation()
  }, [unirepUser])

  if (!reputation) return <div></div>
  return (
    <div className={CardStyle}>
      <h2 className={DataTitleStyle}>Your Reputation</h2>
      <p className={DataStyle}>Positive Rep: {reputation.posRep || 0}</p>
      <p className={DataStyle}>Negative Rep: {reputation.negRep || 0}</p>
      <p className={DataStyle}>Graffiti: {reputation.graffiti || 0}</p>
      <p className={DataStyle}>
        Timestamp: {reputation?.timestamp ? new Date(reputation?.timestamp * 1000)?.toLocaleString?.() : 0}
      </p>
    </div>
  )
}

export default ReputationCard
