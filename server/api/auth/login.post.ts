import { z } from 'zod'
import * as argon2 from 'argon2'

const bodySchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi')
})

export default defineEventHandler(async (event) => {
  const result = bodySchema.safeParse(await readBody(event))
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0].message
    })
  }

  const { email, password } = result.data

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Email atau password salah' })
  }

  const passwordValid = await argon2.verify(user.passwordHash, password)
  if (!passwordValid) {
    throw createError({ statusCode: 401, statusMessage: 'Email atau password salah' })
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      nama: user.nama,
      role: user.role
    }
  })

  return {
    user: {
      id: user.id,
      email: user.email,
      nama: user.nama,
      role: user.role
    }
  }
})
