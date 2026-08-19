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

  const { nama, waliKelasId, semesterId } = result.data

  const existing = await prisma.kelas.findFirst({
    where: { nama, semesterId }
  })
  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: `Kelas "${nama}" sudah ada di semester ini`
    })
  }

  const semester = await prisma.semester.findFirst({
    where: { id: semesterId, deletedAt: null }
  })
  if (!semester) {
    throw createError({ statusCode: 404, statusMessage: 'Semester tidak ditemukan' })
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
    data: { nama, waliKelasId: waliKelasId || null, semesterId },
    include: {
      waliKelas: { select: { id: true, nama: true, nip: true } },
      semester: { include: { tahunAjaran: true } }
    }
  })
})