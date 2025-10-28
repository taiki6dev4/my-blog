import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// お知らせ一覧取得
export async function GET() {
  try {
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

    return NextResponse.json(announcements)
  } catch (error) {
    return NextResponse.json(
      { error: 'お知らせの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// お知らせ投稿
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      )
    }

    const { title, content } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'タイトルと内容は必須です' },
        { status: 400 }
      )
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        authorId: session.user.id,
      },
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
    })

    // Push通知を送信
    await sendPushNotifications(announcement)

    return NextResponse.json(announcement)
  } catch (error) {
    return NextResponse.json(
      { error: 'お知らせの投稿に失敗しました' },
      { status: 500 }
    )
  }
}

async function sendPushNotifications(announcement: any) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany()

    const webpush = require('web-push')

    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(
        'mailto:taiki6dev4@gmail.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      )

      const payload = JSON.stringify({
        title: '新しいお知らせ',
        body: announcement.title,
        url: `/announcements/${announcement.id}`,
      })

      await Promise.all(
        subscriptions.map(async (subscription) => {
          try {
            await webpush.sendNotification(
              {
                endpoint: subscription.endpoint,
                keys: {
                  p256dh: subscription.p256dh,
                  auth: subscription.auth,
                },
              },
              payload
            )
          } catch (error) {
            console.error('Push通知の送信に失敗:', error)
            // 無効なサブスクリプションを削除
            await prisma.pushSubscription.delete({
              where: { id: subscription.id },
            })
          }
        })
      )
    }
  } catch (error) {
    console.error('Push通知の処理に失敗:', error)
  }
}
