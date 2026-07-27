import { updateKelasSchema } from './schema'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id')!)
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'ID tidak valid' })

  const body = await readBody(event)
  const result = updateKelasSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0].message
    })
  }

  const existing = await prisma.kelas.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Kelas tidak ditemukan' })

  const { nama, waliKelasId, tahunAjaranId } = result.data

  if (nama) {
    const duplicate = await prisma.kelas.findFirst({
      where: {
        nama,
        tahunAjaranId: tahunAjaranId ?? existing.tahunAjaranId,
        id: { not: id }
      }
    })
    if (duplicate) {
      throw createError({
        statusCode: 409,
        statusMessage: `Kelas "${nama}" sudah ada di tahun ajaran ini`
      })
    }
  }

  if (waliKelasId !== undefined && waliKelasId !== null) {
    const guru = await prisma.user.findFirst({
      where: { id: waliKelasId, role: 'GURU' }
    })
    if (!guru) {
      throw createError({ statusCode: 404, statusMessage: 'Guru tidak ditemukan' })
    }
  }

  return await prisma.kelas.update({
    where: { id },
    data: {
      ...(nama !== undefined && { nama }),
      ...(waliKelasId !== undefined && { waliKelasId: waliKelasId || null }),
      ...(tahunAjaranId !== undefined && { tahunAjaranId })
    },
    include: {
      waliKelas: { select: { id: true, nama: true, nip: true } },
      tahunAjaran: true
    }
  })
})
