import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcrypt'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:dev.db'
})
const prisma = new PrismaClient({ adapter })

async function main() {
  const passwordHash = await bcrypt.hash('123456', 10)

  const owner = await prisma.user.upsert({
    where: { phone: '+998901234567' },
    update: {},
    create: {
      phone: '+998901234567',
      passwordHash,
      firstName: 'Asosiy',
      lastName: 'Owner',
      role: 'OWNER',
      status: 'ACTIVE',
    },
  })

  console.log("Muvaffaqiyatli yaratildi:", owner.firstName)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
