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

  const { nama, nip, nomorHp, jenisKelamin, keterangan } = result.data

  return await prisma.ptkPendamping.create({
    data: {
      nama,
      nip: nip ?? null,
      nomorHp: nomorHp ?? null,
      jenisKelamin: jenisKelamin ?? null,
      keterangan: keterangan ?? null
    }
  })
})