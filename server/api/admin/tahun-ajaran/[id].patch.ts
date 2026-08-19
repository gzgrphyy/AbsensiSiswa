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

  const existing = await prisma.tahunAjaran.findFirst({
    where: { id, deletedAt: null },
    include: { _count: { select: { semester: true } } }
  })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Tahun ajaran tidak ditemukan' })

  const { nama, kodeAngka, pakaiRomawi, isActive, tanggalMulai, tanggalAkhir } = result.data

  if (existing._count.semester > 0 && nama !== undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tahun ajaran yang sudah memiliki semester tidak bisa diubah namanya'
    })
  }

  if (nama !== undefined) {
    const duplicate = await prisma.tahunAjaran.findFirst({
      where: {
        nama,
        id: { not: id }
      }
    })
    if (duplicate) {
      throw createError({
        statusCode: 409,
        statusMessage: `Tahun ajaran "${nama}" sudah ada`
      })
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (isActive === true) {
      await tx.tahunAjaran.updateMany({
        where: { isActive: true, deletedAt: null, id: { not: id } },
        data: { isActive: false }
      })
    }

    return await tx.tahunAjaran.update({
      where: { id },
      data: {
        ...(nama !== undefined && { nama }),
        ...(kodeAngka !== undefined && { kodeAngka }),
        ...(pakaiRomawi !== undefined && { pakaiRomawi }),
        ...(isActive !== undefined && { isActive }),
        ...(tanggalMulai !== undefined && { tanggalMulai: tanggalMulai ? new Date(tanggalMulai) : null }),
        ...(tanggalAkhir !== undefined && { tanggalAkhir: tanggalAkhir ? new Date(tanggalAkhir) : null })
      }
    })
  })

  return updated
})