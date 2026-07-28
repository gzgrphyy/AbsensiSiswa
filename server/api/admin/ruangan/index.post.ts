import { createRuanganSchema } from './schema'
import { randomUUID } from 'node:crypto'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = createRuanganSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0].message
    })
  }

  const { nama, jenis } = result.data

  const qrCode = randomUUID()

  return await prisma.ruangan.create({
    data: { nama, jenis, qrCode }
  })
})
