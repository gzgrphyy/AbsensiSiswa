import { createSiswaSchema } from './schema'
import { dummyAvatarPath } from '../../../utils/avatar'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = createSiswaSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0].message
    })
  }

  const { nisn, nama, email, kelasId, jenisKelamin, namaWali, emailWali, kontakWali, nomorHp1, nomorHp2 } = result.data

  const existingNisn = await prisma.siswa.findUnique({ where: { nisn } })
  if (existingNisn) {
    throw createError({
      statusCode: 409,
      statusMessage: `NISN "${nisn}" sudah digunakan`
    })
  }

  const existingEmail = await prisma.user.findUnique({ where: { email } })
  if (existingEmail) {
    throw createError({
      statusCode: 409,
      statusMessage: `Email "${email}" sudah digunakan`
    })
  }

  const kelas = await prisma.kelas.findUnique({ where: { id: kelasId } })
  if (!kelas) {
    throw createError({ statusCode: 404, statusMessage: 'Kelas tidak ditemukan' })
  }

  const rawPassword = generatePassword(10)
  const passwordHash = hashPassword(rawPassword)

  const siswa = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { nama, email, passwordHash, role: 'SISWA', isActive: true, jenisKelamin, foto: dummyAvatarPath(nama, jenisKelamin ?? null) }
    })

    return await tx.siswa.create({
      data: {
        userId: user.id,
        nisn,
        nama,
        kelasId,
        namaWali: namaWali || null,
        emailWali: emailWali || null,
        kontakWali: kontakWali || null,
        nomorHp1: nomorHp1 || null,
        nomorHp2: nomorHp2 || null
      },
      include: {
        user: { select: { id: true, nama: true, email: true, isActive: true, foto: true, jenisKelamin: true } },
        kelas: { select: { id: true, nama: true } }
      }
    })
  })

  return {
    ...siswa,
    generatedPassword: rawPassword,
    message: 'Akun siswa berhasil dibuat. Salin password dan sampaikan ke siswa bersangkutan.'
  }
})
