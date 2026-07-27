import { z } from 'zod'

export const createRuanganSchema = z.object({
  nama: z.string().min(1, 'Nama ruangan wajib diisi').max(100)
})

export const updateRuanganSchema = z.object({
  nama: z.string().min(1, 'Nama ruangan wajib diisi').max(100).optional()
})
