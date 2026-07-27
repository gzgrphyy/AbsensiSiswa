import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../server/utils/password'

const prisma = new PrismaClient()

async function main() {
  const adminHash = hashPassword('Admin123')
  const guruHash = hashPassword('Guru123')
  const siswaHash = hashPassword('Siswa123')

  // Admin
  await prisma.user.upsert({
    where: { email: 'admin@absensi.test' },
    update: { passwordHash: adminHash },
    create: {
      nama: 'Admin Utama',
      email: 'admin@absensi.test',
      passwordHash: adminHash,
      role: 'ADMIN'
    }
  })

  // Guru
  await prisma.user.upsert({
    where: { email: 'guru@absensi.test' },
    update: { passwordHash: guruHash },
    create: {
      nama: 'Guru Satu',
      email: 'guru@absensi.test',
      passwordHash: guruHash,
      role: 'GURU'
    }
  })

  // Siswa
  const siswaUser = await prisma.user.upsert({
    where: { email: 'siswa@absensi.test' },
    update: { passwordHash: siswaHash },
    create: {
      nama: 'Siswa Contoh',
      email: 'siswa@absensi.test',
      passwordHash: siswaHash,
      role: 'SISWA'
    }
  })

  // Ruangan contoh
  await prisma.ruangan.upsert({
    where: { qrCode: 'R-001' },
    update: {},
    create: {
      nama: 'Kelas 9A',
      qrCode: 'R-001'
    }
  })

  await prisma.ruangan.upsert({
    where: { qrCode: 'R-002' },
    update: {},
    create: {
      nama: 'Lab Komputer',
      qrCode: 'R-002'
    }
  })

  console.log('Seed berhasil!')
  console.log('  ADMIN : admin@absensi.test / Admin123')
  console.log('  GURU  : guru@absensi.test / Guru123')
  console.log('  SISWA : siswa@absensi.test / Siswa123')
  console.log('  Ruangan: R-001 (Kelas 9A), R-002 (Lab Komputer)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
