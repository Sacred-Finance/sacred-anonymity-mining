// User.tsx
import React from 'react'
import { User } from '@components/Discourse/types'

const UserComponent: React.FC<{ user: User }> = ({ user }) => (
  <div className="flex items-center space-x-2">
    <img src={user.avatar_template} alt="Avatar" className="h-8 w-8 rounded-full" />
    <div className="font-bold">{user.username}</div>
    <div>({user.name})</div>
  </div>
)
export default UserComponent
