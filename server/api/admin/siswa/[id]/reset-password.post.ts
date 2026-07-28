export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id')!)
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'ID tidak valid' })

  const siswa = await prisma.siswa.findUnique({
    where: { id },
    include: { user: true }
  })
  if (!siswa) throw createError({ statusCode: 404, statusMessage: 'Siswa tidak ditemukan' })

  const rawPassword = generatePassword(10)
  const passwordHash = hashPassword(rawPassword)

  await prisma.user.update({
    where: { id: siswa.userId },
    data: { passwordHash }
  })

  return {
    generatedPassword: rawPassword,
    message: 'Password berhasil di-reset. Salin password di bawah dan sampaikan ke siswa bersangkutan.'
  }
})
