import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  // 管理者ユーザーを作成
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: await hashPassword('admin123'),
      role: 'ADMIN',
    },
  })

  // 参加者ユーザーを作成
  const participant = await prisma.user.upsert({
    where: { username: 'user1' },
    update: {},
    create: {
      username: 'user1',
      password: await hashPassword('user123'),
      role: 'PARTICIPANT',
    },
  })

  console.log('ユーザーを作成しました:')
  console.log('管理者: username=admin, password=admin123')
  console.log('参加者: username=user1, password=user123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
