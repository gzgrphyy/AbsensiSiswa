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
    include: { _count: { select: { kelas: true } } }
  })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Tahun ajaran tidak ditemukan' })

  const { nama, semester, isActive } = result.data

  if (existing._count.kelas > 0 && (nama !== undefined || semester !== undefined)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tahun ajaran yang sudah memiliki kelas tidak bisa diubah nama/semesternya'
    })
  }

  if (nama !== undefined || semester !== undefined) {
    const duplicate = await prisma.tahunAjaran.findFirst({
      where: {
        nama: nama ?? existing.nama,
        semester: semester ?? existing.semester,
        id: { not: id },
        deletedAt: null
      }
    })
    if (duplicate) {
      throw createError({
        statusCode: 409,
        statusMessage: `Tahun ajaran "${nama ?? existing.nama} ${semester ?? existing.semester}" sudah ada`
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
        ...(semester !== undefined && { semester }),
        ...(isActive !== undefined && { isActive })
      }
    })
  })

  return updated
})
