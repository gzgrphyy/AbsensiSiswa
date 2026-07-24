import { PrismaClient } from '@prisma/client'
import * as argon2 from 'argon2'

const prisma = new PrismaClient()

async function main() {
  const adminHash = await argon2.hash('Admin123')
  const guruHash = await argon2.hash('Guru123')

  await prisma.user.upsert({
    where: { email: 'admin@absensi.test' },
    update: {},
    create: {
      nama: 'Admin Utama',
      email: 'admin@absensi.test',
      passwordHash: adminHash,
      role: 'ADMIN'
    }
  })

  await prisma.user.upsert({
    where: { email: 'guru@absensi.test' },
    update: {},
    create: {
      nama: 'Guru Satu',
      email: 'guru@absensi.test',
      passwordHash: guruHash,
      role: 'GURU'
    }
  })

  console.log('Seed berhasil: ADMIN (admin@absensi.test / Admin123) & GURU (guru@absensi.test / Guru123)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
