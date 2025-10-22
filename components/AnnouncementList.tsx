'use client'

import { useState } from 'react'
import AnnouncementForm from './AnnouncementForm'
import AnnouncementItem from './AnnouncementItem'

type Announcement = {
  id: string
  title: string
  content: string
  createdAt: Date
  author: {
    id: string
    username: string
    role: string
  }
  comments: Array<{
    id: string
    content: string
    createdAt: Date
    author: {
      id: string
      username: string
      role: string
    }
  }>
}

export default function AnnouncementList({
  announcements: initialAnnouncements,
  session,
}: {
  announcements: Announcement[]
  session: any
}) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements)
  const [showForm, setShowForm] = useState(false)

  const handleAnnouncementCreated = (newAnnouncement: Announcement) => {
    setAnnouncements([newAnnouncement, ...announcements])
    setShowForm(false)
  }

  const handleCommentAdded = (announcementId: string, comment: any) => {
    setAnnouncements(
      announcements.map((announcement) =>
        announcement.id === announcementId
          ? {
              ...announcement,
              comments: [...announcement.comments, comment],
            }
          : announcement
      )
    )
  }

  return (
    <div className="space-y-6">
      {session.user.role === 'ADMIN' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {showForm ? 'キャンセル' : '新しいお知らせを投稿'}
          </button>
          {showForm && (
            <div className="mt-4">
              <AnnouncementForm onSuccess={handleAnnouncementCreated} />
            </div>
          )}
        </div>
      )}

      {announcements.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          お知らせはまだありません
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <AnnouncementItem
              key={announcement.id}
              announcement={announcement}
              session={session}
              onCommentAdded={handleCommentAdded}
            />
          ))}
        </div>
      )}
    </div>
  )
}
