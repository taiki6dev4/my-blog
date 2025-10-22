import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

describe('ユーザー管理機能', () => {
  let adminUser: any

  beforeAll(async () => {
    // 既存データをクリーンアップ
    await prisma.user.deleteMany({ where: { username: 'admin_user_test' } })

    // 管理者ユーザーを作成
    adminUser = await prisma.user.create({
      data: {
        username: 'admin_user_test',
        password: await hashPassword('admin123'),
        role: 'ADMIN',
      },
    })
  })

  afterAll(async () => {
    // テストデータのクリーンアップ
    await prisma.user.deleteMany({
      where: {
        username: {
          in: ['admin_user_test', 'newuser_test', 'participant_test'],
        },
      },
    })
    await prisma.$disconnect()
  })

  describe('ユーザー作成', () => {
    it('管理者が新しいユーザーを作成できること', async () => {
      const newUser = await prisma.user.create({
        data: {
          username: 'newuser_test',
          password: await hashPassword('password123'),
          role: 'PARTICIPANT',
        },
      })

      expect(newUser).toBeDefined()
      expect(newUser.username).toBe('newuser_test')
      expect(newUser.role).toBe('PARTICIPANT')
      expect(newUser.password).not.toBe('password123') // ハッシュ化されている
    })

    it('重複するユーザー名では作成できないこと', async () => {
      await expect(
        prisma.user.create({
          data: {
            username: 'newuser_test', // 既に存在
            password: await hashPassword('password123'),
            role: 'PARTICIPANT',
          },
        })
      ).rejects.toThrow()
    })

    it('管理者ユーザーも作成できること', async () => {
      const adminUser = await prisma.user.create({
        data: {
          username: 'participant_test',
          password: await hashPassword('admin456'),
          role: 'ADMIN',
        },
      })

      expect(adminUser.role).toBe('ADMIN')
    })
  })

  describe('ユーザー一覧取得', () => {
    it('すべてのユーザーを取得できること', async () => {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          role: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      expect(Array.isArray(users)).toBe(true)
      expect(users.length).toBeGreaterThan(0)
      expect(users[0]).not.toHaveProperty('password') // パスワードは含まれない
    })

    it('ユーザー情報にパスワードが含まれないこと', async () => {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          role: true,
          createdAt: true,
        },
      })

      users.forEach((user) => {
        expect(user).not.toHaveProperty('password')
      })
    })
  })

  describe('ユーザー削除', () => {
    it('ユーザーを削除できること', async () => {
      // テスト用ユーザーを作成
      const userToDelete = await prisma.user.create({
        data: {
          username: 'to_delete_test',
          password: await hashPassword('password123'),
          role: 'PARTICIPANT',
        },
      })

      // 削除
      await prisma.user.delete({
        where: { id: userToDelete.id },
      })

      // 削除されたことを確認
      const deletedUser = await prisma.user.findUnique({
        where: { id: userToDelete.id },
      })

      expect(deletedUser).toBeNull()
    })
  })
})
