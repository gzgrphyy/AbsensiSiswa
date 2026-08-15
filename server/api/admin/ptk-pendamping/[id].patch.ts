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

  const { kelasId, nama, nip, nomorHp, keterangan } = result.data

  const finalKelasId = kelasId !== undefined ? kelasId : existing.kelasId
  if (finalKelasId) {
    const kelas = await prisma.kelas.findUnique({ where: { id: finalKelasId } })
    if (!kelas) throw createError({ statusCode: 404, statusMessage: 'Kelas tidak ditemukan' })

    const pemakaian = await prisma.ptkPendamping.findFirst({
      where: { kelasId: finalKelasId, id: { not: id } }
    })
    if (pemakaian) {
      throw createError({
        statusCode: 409,
        statusMessage: `Kelas ${kelas.nama} sudah memiliki pendamping "${pemakaian.nama}". Satu kelas hanya boleh memiliki 1 pendamping.`
      })
    }
  }

  return await prisma.ptkPendamping.update({
    where: { id },
    data: {
      ...(kelasId !== undefined && { kelasId: kelasId ?? null }),
      ...(nama !== undefined && { nama }),
      ...(nip !== undefined && { nip: nip ?? null }),
      ...(nomorHp !== undefined && { nomorHp: nomorHp ?? null }),
      ...(keterangan !== undefined && { keterangan: keterangan ?? null })
    }
  })
})