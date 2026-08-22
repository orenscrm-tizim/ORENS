import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import fs from 'fs'
import path from 'path'

let dbPath = process.env.DATABASE_URL?.replace('file:', '') || './prisma/dev.db'

// Vercel read-only fayl tizimini aylanib o'tish uchun:
if (process.env.VERCEL) {
  dbPath = '/tmp/dev.db'
  const bundledDbPath = path.join(process.cwd(), 'prisma', 'dev.db')
  if (!fs.existsSync(dbPath) && fs.existsSync(bundledDbPath)) {
    fs.copyFileSync(bundledDbPath, dbPath)
  }
}

const adapter = new PrismaBetterSqlite3({
  url: dbPath
})

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
