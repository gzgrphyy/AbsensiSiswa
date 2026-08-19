import { z } from 'zod'

const nisnRegex = /^\d{10}$/

export const createSiswaSchema = z.object({
  nisn: z.string().regex(nisnRegex, 'NISN harus tepat 10 digit angka'),
  nama: z.string().min(1, 'Nama siswa wajib diisi'),
  email: z.string().email('Format email tidak valid'),
  kelasId: z.number().int().positive('Kelas wajib dipilih'),
  jenisKelamin: z.enum(['LAKI_LAKI', 'PEREMPUAN'], { errorMap: () => ({ message: 'Jenis kelamin wajib diisi' }) }),
  namaWali: z.string().optional(),
  emailWali: z.string().email('Format email tidak valid').optional(),
  kontakWali: z.string().max(20).optional(),
  kontakWali2: z.string().max(20).optional(),
  nomorHp1: z.string().max(20).optional(),
  nomorHp2: z.string().max(20).optional()
})

export const updateSiswaSchema = z.object({
  nisn: z.string().regex(nisnRegex, 'NISN harus tepat 10 digit angka').optional(),
  nama: z.string().min(1, 'Nama siswa wajib diisi').optional(),
  email: z.string().email('Format email tidak valid').optional(),
  kelasId: z.number().int().positive('Kelas wajib dipilih').optional(),
  jenisKelamin: z.enum(['LAKI_LAKI', 'PEREMPUAN']).optional().nullable(),
  namaWali: z.string().optional().nullable(),
  emailWali: z.string().email('Format email tidak valid').optional().nullable(),
  kontakWali: z.string().max(20).optional().nullable(),
  kontakWali2: z.string().max(20).optional().nullable(),
  nomorHp1: z.string().max(20).optional().nullable(),
  nomorHp2: z.string().max(20).optional().nullable()
})
