'use client'

import { useState } from 'react'
import UserList from './UserList'
import UserCreateForm from './UserCreateForm'

type User = {
  id: string
  username: string
  role: string
  createdAt: Date
  _count: {
    announcements: number
    comments: number
  }
}

export default function UserManagement({
  users: initialUsers,
  currentUserId,
}: {
  users: User[]
  currentUserId: string
}) {
  const [users, setUsers] = useState(initialUsers)
  const [showForm, setShowForm] = useState(false)

  const handleUserCreated = (newUser: User) => {
    setUsers([newUser, ...users])
    setShowForm(false)
  }

  const handleUserDeleted = (userId: string) => {
    setUsers(users.filter((user) => user.id !== userId))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">ユーザー管理</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showForm ? 'キャンセル' : '新しいユーザーを追加'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">新規ユーザー作成</h2>
          <UserCreateForm onSuccess={handleUserCreated} />
        </div>
      )}

      <UserList
        users={users}
        currentUserId={currentUserId}
        onUserDeleted={handleUserDeleted}
      />
    </div>
  )
}
