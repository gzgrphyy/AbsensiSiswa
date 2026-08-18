import { PrismaClient, JenisKelamin } from '@prisma/client'
import { inferJK } from './inferJK'

const prisma = new PrismaClient()

async function main() {
  const dryRun = process.argv.includes('--dry-run')

  const gurus = await prisma.user.findMany({
    where: { role: 'GURU' },
    select: { id: true, nama: true, jenisKelamin: true }
  })
  const pendamping = await prisma.ptkPendamping.findMany({
    select: { id: true, nama: true, jenisKelamin: true }
  })

  const updates: { label: string; id: number; nama: string; jk: JenisKelamin }[] = []
  const takTerinfer: { label: string; id: number; nama: string }[] = []

  for (const g of gurus) {
    const jk = inferJK(g.nama)
    if (!jk) { takTerinfer.push({ label: 'GURU', id: g.id, nama: g.nama }); continue }
    if (g.jenisKelamin !== jk) updates.push({ label: 'GURU', id: g.id, nama: g.nama, jk })
  }
  for (const p of pendamping) {
    const jk = inferJK(p.nama)
    if (!jk) { takTerinfer.push({ label: 'PENDAMPING', id: p.id, nama: p.nama }); continue }
    if (p.jenisKelamin !== jk) updates.push({ label: 'PENDAMPING', id: p.id, nama: p.nama, jk })
  }

  console.log(`Total GURU: ${gurus.length} | Total PENDAMPING: ${pendamping.length}`)
  console.log(`Akan diubah: ${updates.length} record`)
  console.log(`Tidak terinferensi: ${takTerinfer.length} record`)

  if (takTerinfer.length) {
    console.log('\n--- Nama yang tidak bisa diinferensi (JK dibiarkan NULL) ---')
    for (const t of takTerinfer) console.log(`  [${t.label}] id=${t.id} ${t.nama}`)
  }

  if (updates.length) {
    console.log('\n--- Rencana perubahan ---')
    for (const u of updates) console.log(`  [${u.label}] id=${u.id} -> ${u.jk} | ${u.nama}`)
  }

  if (dryRun) {
    console.log('\n(dry-run: tidak ada perubahan yang ditulis)')
    await prisma.$disconnect()
    return
  }

  console.log('\nMenulis perubahan ke database...')
  for (const u of updates) {
    if (u.label === 'GURU') {
      await prisma.user.update({ where: { id: u.id }, data: { jenisKelamin: u.jk } })
    } else {
      await prisma.ptkPendamping.update({ where: { id: u.id }, data: { jenisKelamin: u.jk } })
    }
  }

  const gurusBaru = await prisma.user.count({ where: { role: 'GURU', jenisKelamin: { not: null } } })
  const pendampingBaru = await prisma.ptkPendamping.count({ where: { jenisKelamin: { not: null } } })
  console.log(`Selesai. GURU dengan JK: ${gurusBaru}/${gurus.length} | PENDAMPING dengan JK: ${pendampingBaru}/${pendamping.length}`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
