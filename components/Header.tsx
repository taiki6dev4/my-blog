'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'

export default function Header({ session }: { session: any }) {
  return (
    <header className="bg-white shadow">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold text-gray-900">
              お知らせアプリ
            </Link>
            {session.user.role === 'ADMIN' && (
              <Link
                href="/users"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ユーザー管理
              </Link>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {session.user.name} ({session.user.role === 'ADMIN' ? '管理者' : '参加者'})
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
