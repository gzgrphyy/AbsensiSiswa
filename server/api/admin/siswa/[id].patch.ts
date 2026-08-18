import { updateSiswaSchema } from './schema'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id')!)
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'ID tidak valid' })

  const body = await readBody(event)
  const result = updateSiswaSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0].message
    })
  }

  const existing = await prisma.siswa.findUnique({
    where: { id },
    include: { user: { select: { id: true, email: true } } }
  })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Siswa tidak ditemukan' })

  const { nisn, nama, email, kelasId, jenisKelamin, namaWali, kontakWali, nomorHp1, nomorHp2 } = result.data

  if (nisn && nisn !== existing.nisn) {
    const nisnExists = await prisma.siswa.findUnique({ where: { nisn } })
    if (nisnExists) {
      throw createError({ statusCode: 409, statusMessage: `NISN "${nisn}" sudah digunakan` })
    }
  }

  if (email && existing.user && email !== existing.user.email) {
    const emailExists = await prisma.user.findUnique({ where: { email } })
    if (emailExists) {
      throw createError({ statusCode: 409, statusMessage: `Email "${email}" sudah digunakan` })
    }
  }

  if (kelasId) {
    const kelas = await prisma.kelas.findUnique({ where: { id: kelasId } })
    if (!kelas) throw createError({ statusCode: 404, statusMessage: 'Kelas tidak ditemukan' })
  }

  return await prisma.$transaction(async (tx) => {
    if (existing.user && (nama !== undefined || email !== undefined || jenisKelamin !== undefined)) {
      await tx.user.update({
        where: { id: existing.user.id },
        data: {
          ...(nama !== undefined && { nama }),
          ...(email !== undefined && { email }),
          ...(jenisKelamin !== undefined && { jenisKelamin: jenisKelamin || null })
        }
      })
    }

    return await tx.siswa.update({
      where: { id },
      data: {
        ...(nisn !== undefined && { nisn }),
        ...(nama !== undefined && { nama }),
        ...(kelasId !== undefined && { kelasId }),
        ...(namaWali !== undefined && { namaWali: namaWali || null }),
        ...(kontakWali !== undefined && { kontakWali: kontakWali || null }),
        ...(nomorHp1 !== undefined && { nomorHp1: nomorHp1 || null }),
        ...(nomorHp2 !== undefined && { nomorHp2: nomorHp2 || null })
      },
      include: {
        user: { select: { id: true, nama: true, email: true, isActive: true, foto: true, jenisKelamin: true } },
        kelas: { select: { id: true, nama: true } }
      }
    })
  })
})
