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

  const today = new Date(new Date().toISOString().split('T')[0])

  const count = await prisma.sesiAbsensi.count({
    where: { tanggal: today, jadwal: { kelasId: siswa.kelasId } }
  })

  return { adaSesi: count > 0 }
})
