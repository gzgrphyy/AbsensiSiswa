import * as path from 'path'
import * as fs from 'fs'

export default defineEventHandler(async (event) => {
  const { filePath } = await readBody(event) as { filePath: string }

  if (!filePath || !filePath.startsWith('/uploads/')) {
    throw createError({ statusCode: 400, statusMessage: 'Path file tidak valid' })
  }

  const absolutePath = path.resolve(`public${filePath}`)

  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath)
  }

  return { success: true, message: 'File berhasil dihapus' }
})
