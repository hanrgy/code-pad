'use client'

import React from 'react'

interface User {
  id: string
  name: string
  color: string
  cursor?: { line: number; column: number }
}

interface UserListProps {
  users: User[]
  currentUserId?: string
}

const UserList: React.FC<UserListProps> = ({ users, currentUserId }) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-500">Connected:</span>
      <div className="flex space-x-1">
        {users.map((user) => (
          <div
            key={user.id}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2"
            style={{ 
              backgroundColor: user.color,
              borderColor: user.id === currentUserId ? '#1F2937' : 'transparent'
            }}
            title={`${user.name}${user.id === currentUserId ? ' (You)' : ''}`}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        ))}
      </div>
      <span className="text-xs text-gray-400">({users.length})</span>
    </div>
  )
}

export default UserList
