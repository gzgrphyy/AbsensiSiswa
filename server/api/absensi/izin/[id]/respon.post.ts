import { z } from 'zod'

const bodySchema = z.object({
  status: z.enum(['DISETUJUI', 'DITOLAK'])
})

export default defineEventHandler(async (event) => {
  const user = (await getUserSession(event)).user!
  if (user.role !== 'GURU') {
    throw createError({ statusCode: 403, statusMessage: 'Akses ditolak' })
  }

  const id = parseInt(event.context.params!.id)

  const izin = await prisma.izin.findUnique({
    where: { id },
    include: { siswa: { include: { kelas: true } } }
  })
  if (!izin) {
    throw createError({ statusCode: 404, statusMessage: 'Pengajuan tidak ditemukan' })
  }
  if (izin.status !== 'PENDING') {
    throw createError({ statusCode: 400, statusMessage: 'Pengajuan ini sudah diproses' })
  }
  if (izin.siswa.kelas.waliKelasId !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Anda bukan wali kelas murid ini' })
  }

  const result = bodySchema.safeParse(await readBody(event))
  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: result.error.issues[0].message })
  }

  const { status } = result.data

  if (status === 'DITOLAK') {
    const updated = await prisma.izin.update({
      where: { id },
      data: { status, diresponOleh: user.id, diresponPada: new Date() }
    })
    return { success: true, data: updated }
  }

  // DISETUJUI → timpa semua kehadiran murid di tanggal tersebut jadi SAKIT/IZIN
  const updated = await prisma.$transaction(async (tx) => {
    const updatedIzin = await tx.izin.update({
      where: { id },
      data: { status, diresponOleh: user.id, diresponPada: new Date() }
    })

    const sesiList = await tx.sesiAbsensi.findMany({
      where: { tanggal: izin.tanggal, jadwal: { kelasId: izin.siswa.kelasId } },
      select: { id: true }
    })

    const updateData: {
      status: 'SAKIT' | 'IZIN'
      approvedBy: number
      approvedAt: Date
      keterangan?: string | null
    } = {
      status: izin.jenis,
      approvedBy: user.id,
      approvedAt: new Date()
    }
    if (izin.keterangan) updateData.keterangan = izin.keterangan

    for (const s of sesiList) {
      await tx.absensiRequest.upsert({
        where: {
          sesiId_siswaId: { sesiId: s.id, siswaId: izin.siswaId }
        },
        create: {
          sesiId: s.id,
          siswaId: izin.siswaId,
          scannedAt: new Date(),
          ...updateData
        },
        update: updateData
      })
    }

    return updatedIzin
  })

  return { success: true, data: updated }
})