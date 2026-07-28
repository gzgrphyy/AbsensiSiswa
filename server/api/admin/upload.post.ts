import * as path from 'path'
import * as fs from 'fs'

const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon']

export default defineEventHandler(async (event) => {
  const formData = await readFormData(event)
  const file = formData.get('file') as File | null
  const fileType = formData.get('type') as string | null

  if (!file || !fileType) {
    throw createError({ statusCode: 400, statusMessage: 'File dan type required' })
  }

  if (!allowedTypes.includes(file.type)) {
    throw createError({ statusCode: 400, statusMessage: 'Tipe file tidak didukung. Gunakan PNG, JPEG, GIF, WebP, SVG, atau ICO' })
  }

  if (file.size > 10 * 1024 * 1024) {
    throw createError({ statusCode: 400, statusMessage: 'File terlalu besar. Maksimal 10MB' })
  }

  const uploadDir = path.resolve('public/uploads')
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  const ext = file.name.split('.').pop() || 'png'
  const fileName = `${fileType}_${Date.now()}.${ext}`
  const filePath = path.join(uploadDir, fileName)

  const buffer = Buffer.from(await file.arrayBuffer())
  fs.writeFileSync(filePath, buffer)

  return {
    success: true,
    path: `/uploads/${fileName}`,
  }
})
