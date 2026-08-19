import { z } from 'zod'

export const createKelasSchema = z.object({
  nama: z.string().min(1, 'Nama kelas wajib diisi'),
  waliKelasId: z.number().int().positive().optional().nullable(),
  semesterId: z.number().int().positive('Semester wajib dipilih')
})

export const updateKelasSchema = z.object({
  nama: z.string().min(1, 'Nama kelas wajib diisi').optional(),
  waliKelasId: z.number().int().positive().optional().nullable(),
  semesterId: z.number().int().positive('Semester wajib dipilih').optional()
})