import { z } from 'zod'

export const createGuruSchema = z.object({
  nama: z.string().min(1, 'Nama lengkap wajib diisi'),
  email: z.string().email('Format email tidak valid'),
  nip: z.string().max(18, 'NIP maksimal 18 digit').optional(),
  nomorHp1: z.string().max(20).optional(),
  nomorHp2: z.string().max(20).optional(),
  jenisKelamin: z.enum(['LAKI_LAKI', 'PEREMPUAN']).optional().nullable()
})

export const updateGuruSchema = z.object({
  nama: z.string().min(1, 'Nama lengkap wajib diisi').optional(),
  email: z.string().email('Format email tidak valid').optional(),
  nip: z.string().max(18, 'NIP maksimal 18 digit').optional(),
  nomorHp1: z.string().max(20).optional().nullable(),
  nomorHp2: z.string().max(20).optional().nullable(),
  jenisKelamin: z.enum(['LAKI_LAKI', 'PEREMPUAN']).optional().nullable(),
  isActive: z.boolean().optional()
})
