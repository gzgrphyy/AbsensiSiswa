export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const siswa = await prisma.siswa.findUnique({
    where: { userId: session.user.id },
    select: { kelasId: true }
  })
  if (!siswa) {
    throw createError({ statusCode: 404, statusMessage: 'Data murid tidak ditemukan' })
  }

  const now = new Date()

  const count = await prisma.jadwalPelajaran.count({
    where: { kelasId: siswa.kelasId, hari: hariIni(now) as any }
  })

  return { adaSesi: count > 0 }
})