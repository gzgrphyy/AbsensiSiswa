export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      nama: true,
      nip: true,
      email: true,
      role: true,
      isActive: true
    }
  })

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User tidak ditemukan' })
  }

  if (user.role === 'SISWA') {
    const siswa = await prisma.siswa.findUnique({
      where: { userId: user.id },
      include: {
        kelas: { select: { id: true, nama: true } }
      }
    })
    if (siswa) {
      return {
        ...user,
        nisn: siswa.nisn,
        namaSiswa: siswa.nama,
        kelas: siswa.kelas,
        namaWali: siswa.namaWali,
        kontakWali: siswa.kontakWali
      }
    }
  }

  if (user.role === 'GURU') {
    const waliKelas = await prisma.kelas.findMany({
      where: { waliKelasId: user.id },
      select: { id: true, nama: true }
    })
    return {
      ...user,
      waliKelas
    }
  }

  return user
})
