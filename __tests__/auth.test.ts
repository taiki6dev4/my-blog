import { verifyPassword, hashPassword } from '@/lib/auth'

describe('認証ユーティリティ', () => {
  describe('hashPassword', () => {
    it('パスワードをハッシュ化できること', async () => {
      const password = 'testpassword123'
      const hashed = await hashPassword(password)

      expect(hashed).toBeDefined()
      expect(hashed).not.toBe(password)
      expect(hashed.length).toBeGreaterThan(0)
    })

    it('同じパスワードでも異なるハッシュを生成すること', async () => {
      const password = 'testpassword123'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      expect(hash1).not.toBe(hash2)
    })
  })

  describe('verifyPassword', () => {
    it('正しいパスワードで検証が成功すること', async () => {
      const password = 'testpassword123'
      const hashed = await hashPassword(password)

      const isValid = await verifyPassword(password, hashed)
      expect(isValid).toBe(true)
    })

    it('間違ったパスワードで検証が失敗すること', async () => {
      const password = 'testpassword123'
      const wrongPassword = 'wrongpassword'
      const hashed = await hashPassword(password)

      const isValid = await verifyPassword(wrongPassword, hashed)
      expect(isValid).toBe(false)
    })
  })
})
