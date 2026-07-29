import * as path from 'path'
import * as fs from 'fs'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']

export default defineEventHandler(async (event) => {
  try {
    const session = await getUserSession(event)
    if (!session.user) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const parts = await readMultipartFormData(event)
    if (!parts || parts.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'File required' })
    }

    const filePart = parts.find(p => p.name === 'file')
    if (!filePart || !filePart.data || filePart.data.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'File required' })
    }

    const fileType = filePart.type || ''
    const fileName = filePart.filename || 'file.png'

    if (!allowedTypes.includes(fileType)) {
      throw createError({ statusCode: 400, statusMessage: 'Tipe file tidak didukung. Gunakan PNG, JPEG, GIF, atau WebP' })
    }

    if (filePart.data.length > MAX_FILE_SIZE) {
      throw createError({ statusCode: 400, statusMessage: 'File terlalu besar. Maksimal 10MB' })
    }

    const uploadDir = path.resolve('public/uploads/foto')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const ext = fileName.split('.').pop() || 'png'
    const uniqueName = `foto_${session.user.id}_${Date.now()}.${ext}`
    const filePath = path.join(uploadDir, uniqueName)

    fs.writeFileSync(filePath, filePart.data)

    return {
      success: true,
      path: `/uploads/foto/${uniqueName}`,
    }
  } catch (err: any) {
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Gagal mengunggah file',
    })
  }
})
