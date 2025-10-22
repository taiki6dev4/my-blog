import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import UserManagement from '@/components/UserManagement'

export default async function UsersPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  // 管理者以外はアクセス不可
  if (session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          announcements: true,
          comments: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={session} />
      <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <UserManagement users={users} currentUserId={session.user.id} />
      </main>
    </div>
  )
}
