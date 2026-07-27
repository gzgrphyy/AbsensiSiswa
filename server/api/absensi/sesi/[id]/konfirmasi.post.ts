import { z } from 'zod'

const statusEnum = z.enum(['HADIR', 'SAKIT', 'IZIN', 'ALPHA'])

const bodySchema = z.object({
  entries: z.array(z.object({
    siswaId: z.number().int().positive(),
    status: statusEnum,
    keterangan: z.string().max(255).optional().nullable()
  })).min(1, 'Minimal satu entry harus dikonfirmasi')
})

export default defineEventHandler(async (event) => {
  const user = (await getUserSession(event)).user!
  const id = parseInt(event.context.params!.id)

  const sesi = await prisma.sesiAbsensi.findUnique({
    where: { id },
    include: { jadwal: { include: { kelas: { include: { siswa: true } } } } }
  })
  if (!sesi) {
    throw createError({ statusCode: 404, statusMessage: 'Sesi tidak ditemukan' })
  }
  if (sesi.dibukaOleh !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Anda tidak membuka sesi ini' })
  }

  const result = bodySchema.safeParse(await readBody(event))
  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: result.error.issues[0].message })
  }

  const now = new Date()
  const siswaIds = new Set(sesi.jadwal.kelas.siswa.map(s => s.id))

  const updates = result.data.entries
    .filter(e => siswaIds.has(e.siswaId))
    .map(e => ({
      sesiId: id,
      siswaId: e.siswaId,
      status: e.status,
      keterangan: e.keterangan || null,
      approvedBy: user.id,
      approvedAt: now,
      scannedAt: now
    }))

  const existing = await prisma.absensiRequest.findMany({
    where: { sesiId: id },
    select: { siswaId: true }
  })
  const existingIds = new Set(existing.map(r => r.siswaId))

  const toCreate = updates.filter(u => !existingIds.has(u.siswaId))
  const toUpdate = updates.filter(u => existingIds.has(u.siswaId))

  if (toCreate.length > 0) {
    await prisma.absensiRequest.createMany({ data: toCreate })
  }

  for (const u of toUpdate) {
    await prisma.absensiRequest.updateMany({
      where: { sesiId: id, siswaId: u.siswaId },
      data: {
        status: u.status,
        keterangan: u.keterangan,
        approvedBy: u.approvedBy,
        approvedAt: u.approvedAt
      }
    })
  }

  const updated = await prisma.absensiRequest.findMany({
    where: { sesiId: id },
    include: { siswa: { select: { id: true, nama: true, nisn: true } } },
    orderBy: { siswa: { nama: 'asc' } }
  })

  return {
    konfirmedCount: updates.length,
    requests: updated
  }
})
