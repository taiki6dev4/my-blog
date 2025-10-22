import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

describe('コメント機能', () => {
  let testUser: any
  let testAnnouncement: any

  beforeAll(async () => {
    // 既存データをクリーンアップ
    const existingUsers = await prisma.user.findMany({
      where: { username: { in: ['admin_comment_test', 'user_comment_test'] } },
      include: { announcements: true }
    })

    for (const user of existingUsers) {
      for (const announcement of user.announcements) {
        await prisma.comment.deleteMany({ where: { announcementId: announcement.id } })
      }
      await prisma.announcement.deleteMany({ where: { authorId: user.id } })
    }
    await prisma.user.deleteMany({ where: { username: { in: ['admin_comment_test', 'user_comment_test'] } } })

    // テストデータのセットアップ
    const admin = await prisma.user.create({
      data: {
        username: 'admin_comment_test',
        password: await hashPassword('admin123'),
        role: 'ADMIN',
      },
    })

    testUser = await prisma.user.create({
      data: {
        username: 'user_comment_test',
        password: await hashPassword('user123'),
        role: 'PARTICIPANT',
      },
    })

    testAnnouncement = await prisma.announcement.create({
      data: {
        title: 'コメント用お知らせ',
        content: 'コメントテスト用',
        authorId: admin.id,
      },
    })
  })


  afterAll(async () => {
    // テストデータのクリーンアップ
    await prisma.comment.deleteMany()
    await prisma.announcement.deleteMany()
    await prisma.user.deleteMany({ where: { username: { in: ['admin_comment_test', 'user_comment_test'] } } })
    await prisma.$disconnect()
  })

  describe('コメント投稿', () => {
    it('参加者がコメントを投稿できること', async () => {
      const comment = await prisma.comment.create({
        data: {
          content: 'これはテストコメントです',
          authorId: testUser.id,
          announcementId: testAnnouncement.id,
        },
      })

      expect(comment).toBeDefined()
      expect(comment.content).toBe('これはテストコメントです')
      expect(comment.authorId).toBe(testUser.id)
      expect(comment.announcementId).toBe(testAnnouncement.id)
    })

    it('コメントが作成日時を持つこと', async () => {
      const comment = await prisma.comment.create({
        data: {
          content: 'タイムスタンプテスト',
          authorId: testUser.id,
          announcementId: testAnnouncement.id,
        },
      })

      expect(comment.createdAt).toBeInstanceOf(Date)
      expect(comment.updatedAt).toBeInstanceOf(Date)
    })
  })

  describe('コメント取得', () => {
    it('特定のお知らせのコメントを取得できること', async () => {
      await prisma.comment.create({
        data: {
          content: 'コメント1',
          authorId: testUser.id,
          announcementId: testAnnouncement.id,
        },
      })

      await prisma.comment.create({
        data: {
          content: 'コメント2',
          authorId: testUser.id,
          announcementId: testAnnouncement.id,
        },
      })

      const comments = await prisma.comment.findMany({
        where: {
          announcementId: testAnnouncement.id,
        },
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
      })

      expect(Array.isArray(comments)).toBe(true)
      expect(comments.length).toBeGreaterThan(0)
      expect(comments[0].author).toBeDefined()
    })
  })
})
