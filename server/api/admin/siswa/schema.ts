import { z } from 'zod'

export const createSiswaSchema = z.object({
  nisn: z.string().min(1, 'NISN wajib diisi').max(20),
  nama: z.string().min(1, 'Nama siswa wajib diisi'),
  email: z.string().email('Format email tidak valid'),
  kelasId: z.number().int().positive('Kelas wajib dipilih'),
  namaWali: z.string().optional(),
  kontakWali: z.string().max(20).optional()
})

export const updateSiswaSchema = z.object({
  nisn: z.string().min(1, 'NISN wajib diisi').max(20).optional(),
  nama: z.string().min(1, 'Nama siswa wajib diisi').optional(),
  email: z.string().email('Format email tidak valid').optional(),
  kelasId: z.number().int().positive('Kelas wajib dipilih').optional(),
  namaWali: z.string().optional().nullable(),
  kontakWali: z.string().max(20).optional().nullable()
})
