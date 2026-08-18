import { PrismaClient } from '@prisma/client'
import { dummyAvatarPath } from '../server/utils/avatar'

const prisma = new PrismaClient()

async function main() {
  const dryRun = process.argv.includes('--dry-run')

  const users = await prisma.user.findMany({
    where: {
      role: { in: ['GURU', 'SISWA'] },
      foto: null
    },
    select: { id: true, nama: true, jenisKelamin: true, role: true }
  })

  const updates = users.map(u => ({
    label: u.role,
    id: u.id,
    nama: u.nama,
    foto: dummyAvatarPath(u.nama, u.jenisKelamin)
  }))

  console.log(`Total akun tanpa foto (GURU + SISWA): ${users.length}`)
  if (updates.length === 0) {
    console.log('Tidak ada yang perlu diubah.')
    await prisma.$disconnect()
    return
  }

  if (dryRun) {
    console.log('\n--- Rencana perubahan (dry-run) ---')
    for (const u of updates) console.log(`  [${u.label}] id=${u.id} -> ${u.foto} | ${u.nama}`)
    console.log('\n(dry-run: tidak ada perubahan yang ditulis)')
    await prisma.$disconnect()
    return
  }

  console.log('\nMenulis perubahan ke database...')
  for (const u of updates) {
    await prisma.user.update({ where: { id: u.id }, data: { foto: u.foto } })
  }

  const sisa = await prisma.user.count({
    where: { role: { in: ['GURU', 'SISWA'] }, foto: null }
  })
  console.log(`Selesai. ${updates.length} akun diisi foto dummy. Sisa tanpa foto: ${sisa}`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})