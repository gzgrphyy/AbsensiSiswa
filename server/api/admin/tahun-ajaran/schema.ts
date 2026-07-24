import { z } from 'zod'

export const createSchema = z.object({
  nama: z.string().min(1, 'Nama tahun ajaran wajib diisi'),
  semester: z.enum(['GANJIL', 'GENAP']),
  setActive: z.boolean().optional().default(false)
})

export const updateSchema = z.object({
  nama: z.string().min(1, 'Nama tahun ajaran wajib diisi').optional(),
  semester: z.enum(['GANJIL', 'GENAP']).optional(),
  isActive: z.boolean().optional()
})
