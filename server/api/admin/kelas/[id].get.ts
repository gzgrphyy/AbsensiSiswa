export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id')!)
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'ID tidak valid' })

  const data = await prisma.kelas.findUnique({
    where: { id },
    include: {
      waliKelas: { select: { id: true, nama: true, nip: true, jenisKelamin: true, foto: true } },
      tahunAjaran: true,
      _count: { select: { siswa: true, jadwalPelajaran: true } },
      siswa: {
        include: {
          user: { select: { id: true, nama: true, email: true, isActive: true, foto: true, jenisKelamin: true } }
        }
      }
    }
  })

  if (data) {
    data.siswa.sort((a, b) => a.nama.length - b.nama.length || a.nama.localeCompare(b.nama))
  }

  if (!data) throw createError({ statusCode: 404, statusMessage: 'Kelas tidak ditemukan' })

  return data
})
