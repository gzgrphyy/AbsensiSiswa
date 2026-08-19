import { updateSchema } from './schema'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id')!)
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'ID tidak valid' })

  const body = await readBody(event)
  const result = updateSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0].message
    })
  }

  const existing = await prisma.semester.findFirst({
    where: { id, deletedAt: null },
    include: { _count: { select: { kelas: true } } }
  })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Semester tidak ditemukan' })

  const { nama, kodeAngka, pakaiRomawi, isActive, tanggalMulai, tanggalAkhir } = result.data

  if (existing._count.kelas > 0 && nama !== undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Semester yang sudah memiliki kelas tidak bisa diubah jenisnya'
    })
  }

  const targetNama = nama ?? existing.nama
  const resolvedKode = kodeAngka === null ? (existing.kodeAngka ?? (targetNama === 'GANJIL' ? 1 : 2)) : (kodeAngka ?? existing.kodeAngka)
  if (kodeAngka !== undefined && kodeAngka !== null) {
    if (targetNama === 'GANJIL' && kodeAngka % 2 === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Kode/Angka harus angka ganjil untuk semester Ganjil'
      })
    }
    if (targetNama === 'GENAP' && kodeAngka % 2 !== 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Kode/Angka harus angka genap untuk semester Genap'
      })
    }
  }

  const duplicate = await prisma.semester.findFirst({
    where: {
      tahunAjaranId: existing.tahunAjaranId,
      nama: targetNama,
      kodeAngka: resolvedKode,
      id: { not: id }
    }
  })
  if (duplicate) {
    throw createError({
      statusCode: 409,
      statusMessage: `Semester ${targetNama} ${resolvedKode} sudah ada`
    })
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (isActive === true) {
      await tx.semester.updateMany({
        where: { isActive: true, deletedAt: null, id: { not: id } },
        data: { isActive: false }
      })
    }

    return await tx.semester.update({
      where: { id },
      data: {
        ...(nama !== undefined && { nama }),
        ...(kodeAngka !== undefined && { kodeAngka: resolvedKode }),
        ...(pakaiRomawi !== undefined && { pakaiRomawi }),
        ...(isActive !== undefined && { isActive }),
        ...(tanggalMulai !== undefined && { tanggalMulai: tanggalMulai ? new Date(tanggalMulai) : null }),
        ...(tanggalAkhir !== undefined && { tanggalAkhir: tanggalAkhir ? new Date(tanggalAkhir) : null })
      }
    })
  })

  return updated
})