import { createPtkPendampingSchema } from './schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = createPtkPendampingSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0].message
    })
  }

  const { kelasId, nama, nip, nomorHp, keterangan } = result.data

  if (kelasId) {
    const kelas = await prisma.kelas.findUnique({ where: { id: kelasId } })
    if (!kelas) throw createError({ statusCode: 404, statusMessage: 'Kelas tidak ditemukan' })

    const pemakaian = await prisma.ptkPendamping.findUnique({ where: { kelasId } })
    if (pemakaian) {
      throw createError({
        statusCode: 409,
        statusMessage: `Kelas ${kelas.nama} sudah memiliki pendamping "${pemakaian.nama}". Satu kelas hanya boleh memiliki 1 pendamping.`
      })
    }
  }

  return await prisma.ptkPendamping.create({
    data: {
      kelasId: kelasId ?? null,
      nama,
      nip: nip ?? null,
      nomorHp: nomorHp ?? null,
      keterangan: keterangan ?? null
    }
  })
})