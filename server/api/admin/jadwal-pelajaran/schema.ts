import { z } from 'zod'

const hariEnum = z.enum(['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU'])

export const createJadwalSchema = z.object({
  kelasId: z.number().int().positive('Kelas wajib dipilih'),
  ruanganId: z.number().int().positive('Ruangan wajib dipilih'),
  mapel: z.string().min(1, 'Mata pelajaran wajib diisi').max(100),
  guruId: z.number().int().positive('Guru wajib dipilih'),
  ptkPendampingId: z.number().int().positive().nullable().optional(),
  hari: hariEnum,
  jamMulai: z.string().regex(/^\d{2}:\d{2}$/, 'Format jam mulai harus HH:MM'),
  jamSelesai: z.string().regex(/^\d{2}:\d{2}$/, 'Format jam selesai harus HH:MM')
})

export const updateJadwalSchema = z.object({
  kelasId: z.number().int().positive('Kelas wajib dipilih').optional(),
  ruanganId: z.number().int().positive('Ruangan wajib dipilih').optional(),
  mapel: z.string().min(1, 'Mata pelajaran wajib diisi').max(100).optional(),
  guruId: z.number().int().positive('Guru wajib dipilih').optional(),
  ptkPendampingId: z.number().int().positive().nullable().optional(),
  hari: hariEnum.optional(),
  jamMulai: z.string().regex(/^\d{2}:\d{2}$/, 'Format jam mulai harus HH:MM').optional(),
  jamSelesai: z.string().regex(/^\d{2}:\d{2}$/, 'Format jam selesai harus HH:MM').optional()
})
