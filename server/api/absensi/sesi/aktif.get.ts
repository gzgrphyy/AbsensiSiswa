export default defineEventHandler(async (event) => {
  const user = (await getUserSession(event)).user!
  await finalizeExpiredSesi()

  const sesi = await prisma.sesiAbsensi.findMany({
    where: {
      status: 'AKTIF',
      tanggal: todayDate(),
      jadwal: { guruId: user.id }
    },
    include: {
      jadwal: {
        include: {
          kelas: { select: { id: true, nama: true } },
          ruangan: { select: { id: true, nama: true } },
          guru: { select: { id: true, nama: true } }
        }
      },
      _count: { select: { requests: true } }
    }
  })

  return sesi
})