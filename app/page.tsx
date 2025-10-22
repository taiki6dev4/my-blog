import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import AnnouncementList from '@/components/AnnouncementList'
import Header from '@/components/Header'
import PushNotificationSetup from '@/components/PushNotificationSetup'

export default async function Home() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  const announcements = await prisma.announcement.findMany({
    include: {
      author: {
        select: {
          id: true,
          username: true,
          role: true,
        },
      },
      comments: {
        include: {
          author: {
            select: {
              id: true,
              username: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
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
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <PushNotificationSetup />
        </div>
        <AnnouncementList
          announcements={announcements}
          session={session}
        />
      </main>
    </div>
  )
}
