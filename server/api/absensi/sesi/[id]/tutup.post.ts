export default defineEventHandler(async (event) => {
  const user = (await getUserSession(event)).user!
  const id = parseInt(event.context.params!.id)

  const sesi = await prisma.sesiAbsensi.findUnique({
    where: { id }
  })
  if (!sesi) {
    throw createError({ statusCode: 404, statusMessage: 'Sesi tidak ditemukan' })
  }
  if (sesi.dibukaOleh !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Anda tidak membuka sesi ini' })
  }
  if (sesi.status === 'SELESAI') {
    throw createError({ statusCode: 400, statusMessage: 'Sesi sudah ditutup' })
  }

  return await prisma.sesiAbsensi.update({
    where: { id },
    data: { status: 'SELESAI', ditutupPada: new Date() },
    include: {
      jadwal: {
        include: {
          kelas: { select: { id: true, nama: true } },
          ruangan: { select: { id: true, nama: true } }
        }
      },
      _count: { select: { requests: true } }
    }
  })
})
