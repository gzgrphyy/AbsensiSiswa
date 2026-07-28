import { z } from 'zod'

const bodySchema = z.object({
  currentPassword: z.string().min(1, 'Password saat ini wajib diisi'),
  newPassword: z.string().min(6, 'Password baru minimal 6 karakter').max(100)
})

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User tidak ditemukan' })
  }

  const result = bodySchema.safeParse(await readBody(event))
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0].message
    })
  }

  const { currentPassword, newPassword } = result.data

  // Verifikasi password saat ini
  if (!verifyPassword(currentPassword, user.passwordHash)) {
    throw createError({ statusCode: 400, statusMessage: 'Password saat ini salah' })
  }

  // Jangan biarkan sama dengan yang lama
  if (currentPassword === newPassword) {
    throw createError({ statusCode: 400, statusMessage: 'Password baru harus berbeda dari password saat ini' })
  }

  // Hash password baru dan simpan
  const passwordHash = hashPassword(newPassword)
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash }
  })

  return { success: true, message: 'Password berhasil diubah' }
})
