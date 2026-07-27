export default defineEventHandler(async (event) => {
  const user = (await getUserSession(event)).user!

  const sesi = await prisma.sesiAbsensi.findMany({
    where: {
      dibukaOleh: user.id,
      status: 'AKTIF',
      tanggal: new Date(new Date().toISOString().split('T')[0])
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
