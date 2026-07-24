export default defineEventHandler(async (event) => {
  const path = event.path

  if (path === '/api/auth/login' || path === '/api/auth/logout' || path.startsWith('/api/_auth/')) {
    return
  }

  if (!path.startsWith('/api/')) {
    return
  }

  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  if (path.startsWith('/api/admin/') && session.user.role !== 'ADMIN') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  if (path.startsWith('/api/absensi/') && session.user.role !== 'GURU') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
})
