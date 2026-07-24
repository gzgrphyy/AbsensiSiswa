import { createSchema } from './schema'

export default defineEventHandler(async (event) => {
  const result = createSchema.safeParse(await readBody(event))
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0].message
    })
  }

  const { nama, semester, setActive } = result.data

  const existing = await prisma.tahunAjaran.findFirst({
    where: { nama, semester, deletedAt: null }
  })
  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: `Tahun ajaran "${nama} ${semester}" sudah ada`
    })
  }

  const tahunAjaran = await prisma.$transaction(async (tx) => {
    if (setActive) {
      await tx.tahunAjaran.updateMany({
        where: { isActive: true, deletedAt: null },
        data: { isActive: false }
      })
    }

    return await tx.tahunAjaran.create({
      data: { nama, semester, isActive: setActive }
    })
  })

  return tahunAjaran
})
