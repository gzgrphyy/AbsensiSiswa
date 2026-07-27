import { z } from 'zod'

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

  if (!user.isActive) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Akun ini telah dinonaktifkan. Hubungi admin.'
    })
  }

  if (!verifyPassword(password, user.passwordHash)) {
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
