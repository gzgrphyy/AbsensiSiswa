export default defineEventHandler(async (event) => {
  const user = (await getUserSession(event)).user!
  const id = parseInt(event.context.params!.id)

  const sesi = await prisma.sesiAbsensi.findUnique({
    where: { id },
    include: { jadwal: { select: { guruId: true } } }
  })
  if (!sesi) {
    throw createError({ statusCode: 404, statusMessage: 'Sesi tidak ditemukan' })
  }
  if (sesi.jadwal.guruId !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Anda tidak mengampu sesi ini' })
  }
  if (sesi.status === 'SELESAI') {
    throw createError({ statusCode: 400, statusMessage: 'Sesi sudah ditutup' })
  }

  return await finalizeSesi(id)
})