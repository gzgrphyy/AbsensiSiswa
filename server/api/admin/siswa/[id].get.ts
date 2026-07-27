export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id')!)
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'ID tidak valid' })

  const data = await prisma.siswa.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, nama: true, email: true, isActive: true, createdAt: true } },
      kelas: { select: { id: true, nama: true } }
    }
  })

  if (!data) throw createError({ statusCode: 404, statusMessage: 'Siswa tidak ditemukan' })

  return data
})
