import { createGuruSchema } from './schema'
import { dummyAvatarPath } from '../../../utils/avatar'

export default defineEventHandler(async (event) => {
  const result = createGuruSchema.safeParse(await readBody(event))
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0].message
    })
  }

  const { nama, email, nip, nomorHp1, nomorHp2, jenisKelamin } = result.data

  const existingEmail = await prisma.user.findUnique({
    where: { email }
  })
  if (existingEmail) {
    throw createError({
      statusCode: 409,
      statusMessage: `Email "${email}" sudah digunakan`
    })
  }

  if (nip) {
    const existingNip = await prisma.user.findUnique({
      where: { nip }
    })
    if (existingNip) {
      throw createError({
        statusCode: 409,
        statusMessage: `NIP "${nip}" sudah digunakan`
      })
    }
  }

  const rawPassword = generatePassword(10)
  const passwordHash = hashPassword(rawPassword)

  const guru = await prisma.user.create({
    data: {
      nama,
      email,
      nip: nip || null,
      nomorHp1: nomorHp1 || null,
      nomorHp2: nomorHp2 || null,
      jenisKelamin: jenisKelamin ?? null,
      foto: dummyAvatarPath(nama, jenisKelamin ?? null),
      passwordHash,
      role: 'GURU',
      isActive: true
    },
    select: {
      id: true,
      nama: true,
      email: true,
      nip: true,
      isActive: true,
      createdAt: true
    }
  })

  return {
    ...guru,
    generatedPassword: rawPassword,
    message: 'Akun guru berhasil dibuat. Salin password di bawah dan sampaikan ke guru bersangkutan.'
  }
})
