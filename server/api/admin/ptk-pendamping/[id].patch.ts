import { updatePtkPendampingSchema } from './schema'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id')!)
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'ID tidak valid' })

  const body = await readBody(event)
  const result = updatePtkPendampingSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0].message
    })
  }

  const existing = await prisma.ptkPendamping.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'PTK pendamping tidak ditemukan' })

  const { nama, nip, nomorHp, jenisKelamin, keterangan } = result.data

  return await prisma.ptkPendamping.update({
    where: { id },
    data: {
      ...(nama !== undefined && { nama }),
      ...(nip !== undefined && { nip: nip ?? null }),
      ...(nomorHp !== undefined && { nomorHp: nomorHp ?? null }),
      ...(jenisKelamin !== undefined && { jenisKelamin: jenisKelamin ?? null }),
      ...(keterangan !== undefined && { keterangan: keterangan ?? null })
    }
  })
})