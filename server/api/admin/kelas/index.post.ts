import { createKelasSchema } from './schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = createKelasSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0].message
    })
  }

  const { nama, waliKelasId, tahunAjaranId } = result.data

  const existing = await prisma.kelas.findFirst({
    where: { nama, tahunAjaranId }
  })
  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: `Kelas "${nama}" sudah ada di tahun ajaran ini`
    })
  }

  const tahunAjaran = await prisma.tahunAjaran.findFirst({
    where: { id: tahunAjaranId, deletedAt: null }
  })
  if (!tahunAjaran) {
    throw createError({ statusCode: 404, statusMessage: 'Tahun ajaran tidak ditemukan' })
  }

  if (waliKelasId) {
    const guru = await prisma.user.findFirst({
      where: { id: waliKelasId, role: 'GURU' }
    })
    if (!guru) {
      throw createError({ statusCode: 404, statusMessage: 'Guru tidak ditemukan' })
    }
  }

  return await prisma.kelas.create({
    data: { nama, waliKelasId: waliKelasId || null, tahunAjaranId },
    include: {
      waliKelas: { select: { id: true, nama: true, nip: true } },
      tahunAjaran: true
    }
  })
})
