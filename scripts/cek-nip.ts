import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const dryRun = process.argv.includes('--dry-run')

  const gurus = await prisma.user.findMany({ where: { role: 'GURU' }, select: { id: true, nama: true, nip: true } })
  const pend = await prisma.ptkPendamping.findMany({ select: { id: true, nama: true, nip: true } })

  const longG = gurus.filter(g => g.nip && g.nip.length > 18)
  const longP = pend.filter(p => p.nip && p.nip.length > 18)

  console.log('GURU total:', gurus.length, '| NIP > 18 digit:', longG.length)
  for (const g of longG) console.log('  GURU id=' + g.id, JSON.stringify(g.nip), 'len=' + (g.nip?.length ?? 0), g.nama)
  console.log('PENDAMPING total:', pend.length, '| NIP > 18 digit:', longP.length)
  for (const p of longP) console.log('  PEND id=' + p.id, JSON.stringify(p.nip), 'len=' + (p.nip?.length ?? 0), p.nama)

  const lenCount: Record<string, number> = {}
  for (const g of [...gurus, ...pend]) { if (g.nip) lenCount[g.nip.length] = (lenCount[g.nip.length] || 0) + 1 }
  console.log('Distribusi panjang NIP:', JSON.stringify(lenCount))

  if (dryRun) {
    await prisma.$disconnect()
    return
  }

  // Ganti NIP yang > 18 digit dengan NIP 18 digit unik yang valid
  let counter = 1
  const used = new Set<string>()
  const makeNip = () => {
    let nip = ''
    do {
      nip = String(198001010000000000n + BigInt(counter++))
    } while (used.has(nip))
    used.add(nip)
    return nip
  }

  let changed = 0
  for (const g of longG) {
    const nip = makeNip()
    await prisma.user.update({ where: { id: g.id }, data: { nip } })
    console.log(`  GURU id=${g.id} NIP diganti -> ${nip}`)
    changed++
  }
  for (const p of longP) {
    const nip = makeNip()
    await prisma.ptkPendamping.update({ where: { id: p.id }, data: { nip } })
    console.log(`  PEND id=${p.id} NIP diganti -> ${nip}`)
    changed++
  }
  console.log(`Selesai. ${changed} record NIP diganti.`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
