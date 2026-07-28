import { updateRuanganSchema } from './schema'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id')!)
  if (isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'ID tidak valid' })

  const body = await readBody(event)
  const result = updateRuanganSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0].message
    })
  }

  const existing = await prisma.ruangan.findUnique({ where: { id } })
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Ruangan tidak ditemukan' })

  const { nama, jenis } = result.data

  return await prisma.ruangan.update({
    where: { id },
    data: {
      ...(nama !== undefined && { nama }),
      ...(jenis !== undefined && { jenis })
    }
  })
})
