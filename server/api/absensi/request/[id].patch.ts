import { z } from 'zod'

const bodySchema = z.object({
  status: z.enum(['PENDING', 'HADIR', 'SAKIT', 'IZIN', 'ALPHA']).optional(),
  keterangan: z.string().max(255).nullable().optional()
})

export default defineEventHandler(async (event) => {
  const user = (await getUserSession(event)).user!
  const id = parseInt(event.context.params!.id)

  const request = await prisma.absensiRequest.findUnique({
    where: { id },
    include: { sesi: { include: { jadwal: { select: { guruId: true } } } } }
  })
  if (!request) {
    throw createError({ statusCode: 404, statusMessage: 'Request absensi tidak ditemukan' })
  }
  if (request.sesi.jadwal.guruId !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Anda tidak mengampu sesi ini' })
  }

  const result = bodySchema.safeParse(await readBody(event))
  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: result.error.issues[0].message })
  }

  const data: any = {}
  if (result.data.status) data.status = result.data.status
  if (result.data.keterangan !== undefined) data.keterangan = result.data.keterangan
  if (result.data.status && result.data.status !== 'PENDING') {
    data.approvedBy = user.id
    data.approvedAt = new Date()
  }

  return await prisma.absensiRequest.update({
    where: { id },
    data,
    include: { siswa: { select: { id: true, nama: true, nisn: true } } }
  })
})
