import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      )
    }

    const { endpoint, keys } = await request.json()

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: '無効なサブスクリプション情報です' },
        { status: 400 }
      )
    }

    // 既存のサブスクリプションを削除
    await prisma.pushSubscription.deleteMany({
      where: {
        OR: [
          { userId: session.user.id },
          { endpoint },
        ],
      },
    })

    // 新しいサブスクリプションを登録
    const subscription = await prisma.pushSubscription.create({
      data: {
        userId: session.user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    })

    return NextResponse.json(subscription)
  } catch (error) {
    return NextResponse.json(
      { error: 'サブスクリプションの登録に失敗しました' },
      { status: 500 }
    )
  }
}
