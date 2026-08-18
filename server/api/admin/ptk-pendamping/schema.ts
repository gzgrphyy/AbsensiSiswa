import { z } from 'zod'

export const createPtkPendampingSchema = z.object({
  nama: z.string().min(1, 'Nama wajib diisi').max(100),
  nip: z.string().max(18).nullable().optional(),
  nomorHp: z.string().max(20).nullable().optional(),
  jenisKelamin: z.enum(['LAKI_LAKI', 'PEREMPUAN']).nullable().optional(),
  keterangan: z.string().max(255).nullable().optional()
})

export const updatePtkPendampingSchema = z.object({
  nama: z.string().min(1, 'Nama wajib diisi').max(100).optional(),
  nip: z.string().max(18).nullable().optional(),
  nomorHp: z.string().max(20).nullable().optional(),
  jenisKelamin: z.enum(['LAKI_LAKI', 'PEREMPUAN']).nullable().optional(),
  keterangan: z.string().max(255).nullable().optional()
})