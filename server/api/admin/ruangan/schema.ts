import { z } from 'zod'

const jenisEnum = z.enum(['KELAS', 'LAB', 'PERPUSTAKAAN', 'AULA', 'LAINNYA'])

export const createRuanganSchema = z.object({
  nama: z.string().min(1, 'Nama ruangan wajib diisi').max(100),
  jenis: jenisEnum.default('KELAS')
})

export const updateRuanganSchema = z.object({
  nama: z.string().min(1, 'Nama ruangan wajib diisi').max(100).optional(),
  jenis: jenisEnum.optional()
})
