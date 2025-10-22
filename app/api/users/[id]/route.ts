import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// ユーザー削除
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    // 管理者のみアクセス可能
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      )
    }

    const { id } = await params

    // 自分自身は削除できない
    if (id === session.user.id) {
      return NextResponse.json(
        { error: '自分自身は削除できません' },
        { status: 400 }
      )
    }

    // ユーザーが存在するか確認
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    // ユーザーを削除(関連するお知らせ、コメントも cascade で削除される)
    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'ユーザーの削除に失敗しました' },
      { status: 500 }
    )
  }
}
