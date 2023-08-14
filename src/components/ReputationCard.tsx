import React, { useEffect, useState } from 'react'

// Tailwind CSS for simplicity
const CardStyle = 'border border-blue-500 shadow rounded-md p-4   bg-white'
const DataTitleStyle = 'text-blue-500 text-left font-bold text-lg'
const DataStyle = 'text-gray-800 text-left text-sm'

const ReputationCard = ({ unirepUser }) => {
  const [reputation, setReputation] = useState({
    posRep: 0,
  })

  useEffect(() => {
    if (unirepUser?.reputation?.posRep !== undefined) {
      setReputation(unirepUser.reputation)
        console.log('reputation', reputation)
    }
  }, [unirepUser])

  if (!reputation) return <div></div>
  return (
    <div className={CardStyle}>
      <h2 className={DataTitleStyle}>Your Reputation</h2>
      <p className={DataStyle}>Positive Rep: {reputation.posRep || 0}</p>
    </div>
  )
}

export default ReputationCard
