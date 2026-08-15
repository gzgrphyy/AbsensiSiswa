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
      foto: true,
      email: true,
      role: true,
      isActive: true
    }
  })

  if (!user) {
    await clearUserSession(event)
    throw createError({ statusCode: 401, statusMessage: 'Sesi berakhir, silakan login kembali' })
  }

  if (user.role === 'SISWA') {
    const siswa = await prisma.siswa.findUnique({
      where: { userId: user.id },
      include: {
        kelas: {
          select: {
            id: true,
            nama: true,
            waliKelas: { select: { id: true, nama: true } }
          }
        }
      }
    })
    if (siswa) {
      const ptkPendamping = await prisma.ptkPendamping.findMany({
        where: {
          isActive: true,
          kelasId: siswa.kelasId
        },
        select: { id: true, nama: true },
        orderBy: { nama: 'asc' }
      })
      return {
        ...user,
        nisn: siswa.nisn,
        namaSiswa: siswa.nama,
        kelas: siswa.kelas,
        waliKelas: siswa.kelas.waliKelas,
        namaWali: siswa.namaWali,
        kontakWali: siswa.kontakWali,
        ptkPendamping
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
