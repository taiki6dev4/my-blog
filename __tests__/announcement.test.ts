import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

describe('お知らせ機能', () => {
  let adminUser: any
  let participantUser: any

  beforeAll(async () => {
    // 既存ユーザーをクリーンアップ
    await prisma.comment.deleteMany()
    await prisma.announcement.deleteMany()
    await prisma.user.deleteMany({ where: { username: { in: ['admin_announcement_test', 'participant_announcement_test'] } } })

    // テストデータのセットアップ
    adminUser = await prisma.user.create({
      data: {
        username: 'admin_announcement_test',
        password: await hashPassword('admin123'),
        role: 'ADMIN',
      },
    })

    participantUser = await prisma.user.create({
      data: {
        username: 'participant_announcement_test',
        password: await hashPassword('participant123'),
        role: 'PARTICIPANT',
      },
    })
  })


  afterAll(async () => {
    // テストデータのクリーンアップ
    await prisma.comment.deleteMany()
    await prisma.announcement.deleteMany()
    await prisma.user.deleteMany({ where: { username: { in: ['admin_announcement_test', 'participant_announcement_test'] } } })
    await prisma.$disconnect()
  })

  describe('お知らせ投稿', () => {
    it('管理者がお知らせを投稿できること', async () => {
      const announcement = await prisma.announcement.create({
        data: {
          title: 'テストお知らせ',
          content: '# これはテストです\n\n本文はMarkdown形式で記述できます。',
          authorId: adminUser.id,
        },
      })

      expect(announcement).toBeDefined()
      expect(announcement.title).toBe('テストお知らせ')
      expect(announcement.content).toContain('Markdown')
      expect(announcement.authorId).toBe(adminUser.id)
    })

    it('お知らせが作成日時を持つこと', async () => {
      const announcement = await prisma.announcement.create({
        data: {
          title: 'テストお知らせ2',
          content: 'コンテンツ',
          authorId: adminUser.id,
        },
      })

      expect(announcement.createdAt).toBeInstanceOf(Date)
      expect(announcement.updatedAt).toBeInstanceOf(Date)
    })
  })

  describe('お知らせ一覧取得', () => {
    it('すべてのお知らせを取得できること', async () => {
      const announcements = await prisma.announcement.findMany({
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
          createdAt: 'desc',
        },
      })

      expect(Array.isArray(announcements)).toBe(true)
      expect(announcements.length).toBeGreaterThan(0)
      expect(announcements[0].author).toBeDefined()
    })
  })

  describe('お知らせ詳細取得', () => {
    it('特定のお知らせをコメント付きで取得できること', async () => {
      const createdAnnouncement = await prisma.announcement.create({
        data: {
          title: 'コメント付きお知らせ',
          content: 'テスト内容',
          authorId: adminUser.id,
        },
      })

      const comment = await prisma.comment.create({
        data: {
          content: 'テストコメント',
          authorId: participantUser.id,
          announcementId: createdAnnouncement.id,
        },
      })

      const announcement = await prisma.announcement.findUnique({
        where: { id: createdAnnouncement.id },
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

      expect(announcement).toBeDefined()
      expect(announcement?.comments.length).toBeGreaterThanOrEqual(1)
      const foundComment = announcement?.comments.find(c => c.id === comment.id)
      expect(foundComment?.content).toBe('テストコメント')
    })
  })
})
