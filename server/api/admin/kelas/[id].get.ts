export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id')!)
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'ID tidak valid' })

  const data = await prisma.kelas.findUnique({
    where: { id },
    include: {
      waliKelas: { select: { id: true, nama: true, nip: true } },
      tahunAjaran: true,
      _count: { select: { siswa: true, jadwalPelajaran: true } }
    }
  })

  if (!data) throw createError({ statusCode: 404, statusMessage: 'Kelas tidak ditemukan' })

  return data
})
