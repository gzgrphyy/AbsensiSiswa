import { createSchema } from './schema'

export default defineEventHandler(async (event) => {
  const result = createSchema.safeParse(await readBody(event))
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0].message
    })
  }

  const { nama, kodeAngka, pakaiRomawi, setActive, tanggalMulai, tanggalAkhir } = result.data

  const resolvedKode = kodeAngka ?? (nama === 'GANJIL' ? 1 : 2)

  const tahunAjaran = await prisma.tahunAjaran.findFirst({
    where: { isActive: true, deletedAt: null }
  })
  if (!tahunAjaran) {
    throw createError({ statusCode: 400, statusMessage: 'Tidak ada tahun ajaran yang aktif. Aktifkan tahun ajaran terlebih dahulu.' })
  }

  const tahunAjaranId = tahunAjaran.id

  const existing = await prisma.semester.findFirst({
    where: { tahunAjaranId, nama, kodeAngka: resolvedKode }
  })
  if (existing && !existing.deletedAt) {
    throw createError({
      statusCode: 409,
      statusMessage: `Semester ${nama} ${resolvedKode} sudah ada di tahun ajaran "${tahunAjaran.nama}"`
    })
  }

  const semester = await prisma.$transaction(async (tx) => {
    if (setActive) {
      await tx.semester.updateMany({
        where: { isActive: true, deletedAt: null },
        data: { isActive: false }
      })
    }

    if (existing) {
      return await tx.semester.update({
        where: { id: existing.id },
        data: {
          kodeAngka: resolvedKode,
          pakaiRomawi,
          isActive: setActive,
          ...(tanggalMulai && { tanggalMulai: new Date(tanggalMulai) }),
          ...(tanggalAkhir && { tanggalAkhir: new Date(tanggalAkhir) }),
          deletedAt: null
        }
      })
    }

    return await tx.semester.create({
      data: {
        tahunAjaranId,
        nama,
        kodeAngka: resolvedKode,
        pakaiRomawi,
        isActive: setActive,
        ...(tanggalMulai && { tanggalMulai: new Date(tanggalMulai) }),
        ...(tanggalAkhir && { tanggalAkhir: new Date(tanggalAkhir) })
      }
    })
  })

  return semester
})