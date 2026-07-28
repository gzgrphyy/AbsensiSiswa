export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id')!)
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'ID tidak valid' })

  const existing = await prisma.kelas.findUnique({
    where: { id },
    include: { _count: { select: { siswa: true, jadwalPelajaran: true } } }
  })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Kelas tidak ditemukan' })

  if (existing._count.siswa > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Kelas "${existing.nama}" masih memiliki ${existing._count.siswa} murid. Pindahkan atau hapus murid terlebih dahulu.`
    })
  }

  if (existing._count.jadwalPelajaran > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Kelas "${existing.nama}" masih memiliki ${existing._count.jadwalPelajaran} jadwal pelajaran. Hapus jadwal terlebih dahulu.`
    })
  }

  await prisma.kelas.delete({ where: { id } })

  return { message: 'Kelas berhasil dihapus' }
})
