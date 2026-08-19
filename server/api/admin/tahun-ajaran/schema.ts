import { z } from 'zod'

export const createSchema = z.object({
  nama: z.string().min(1, 'Nama tahun ajaran wajib diisi'),
  semester: z.enum(['GANJIL', 'GENAP']),
  setActive: z.boolean().optional().default(false),
  tanggalMulai: z.string().optional().nullable(),
  tanggalAkhir: z.string().optional().nullable()
})

export const updateSchema = z.object({
  nama: z.string().min(1, 'Nama tahun ajaran wajib diisi').optional(),
  semester: z.enum(['GANJIL', 'GENAP']).optional(),
  isActive: z.boolean().optional(),
  tanggalMulai: z.string().optional().nullable(),
  tanggalAkhir: z.string().optional().nullable()
})
