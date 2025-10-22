'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'

type Comment = {
  id: string
  content: string
  createdAt: Date
  author: {
    id: string
    username: string
    role: string
  }
}

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
  comments: Comment[]
}

export default function AnnouncementItem({
  announcement,
  session,
  onCommentAdded,
}: {
  announcement: Announcement
  session: any
  onCommentAdded: (announcementId: string, comment: Comment) => void
}) {
  const [commentContent, setCommentContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: commentContent,
          announcementId: announcement.id,
        }),
      })

      if (!response.ok) {
        throw new Error('コメントの投稿に失敗しました')
      }

      const comment = await response.json()
      setCommentContent('')
      onCommentAdded(announcement.id, comment)
    } catch (error) {
      setError('コメントの投稿に失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="border-b pb-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {announcement.title}
        </h2>
        <div className="text-sm text-gray-500">
          投稿者: {announcement.author.username} | {formatDate(announcement.createdAt)}
        </div>
      </div>

      <div className="prose max-w-none mb-6">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize]}
        >
          {announcement.content}
        </ReactMarkdown>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-4">
          コメント ({announcement.comments.length})
        </h3>

        <div className="space-y-3 mb-4">
          {announcement.comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 p-3 rounded">
              <div className="text-sm text-gray-600 mb-1">
                {comment.author.username} - {formatDate(comment.createdAt)}
              </div>
              <div className="text-gray-900">{comment.content}</div>
            </div>
          ))}
        </div>

        <form onSubmit={handleCommentSubmit} className="space-y-2">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="コメントを入力..."
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'コメント中...' : 'コメントする'}
          </button>
        </form>
      </div>
    </div>
  )
}
