import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

// ユーザー一覧取得
export async function GET() {
  try {
    const session = await auth()

    // 管理者のみアクセス可能
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      )
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

    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json(
      { error: 'ユーザーの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// ユーザー作成
export async function POST(request: Request) {
  try {
    const session = await auth()

    // 管理者のみアクセス可能
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      )
    }

    const { username, password, role } = await request.json()

    // バリデーション
    if (!username || !password || !role) {
      return NextResponse.json(
        { error: 'ユーザー名、パスワード、ロールは必須です' },
        { status: 400 }
      )
    }

    if (role !== 'ADMIN' && role !== 'PARTICIPANT') {
      return NextResponse.json(
        { error: 'ロールはADMINまたはPARTICIPANTである必要があります' },
        { status: 400 }
      )
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: 'ユーザー名は3文字以上である必要があります' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'パスワードは6文字以上である必要があります' },
        { status: 400 }
      )
    }

    // 既存ユーザーチェック
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'このユーザー名は既に使用されています' },
        { status: 409 }
      )
    }

    // ユーザー作成
    const user = await prisma.user.create({
      data: {
        username,
        password: await hashPassword(password),
        role,
      },
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
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json(
      { error: 'ユーザーの作成に失敗しました' },
      { status: 500 }
    )
  }
}
