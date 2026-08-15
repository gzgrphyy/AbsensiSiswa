import { z } from 'zod'

export const createPtkPendampingSchema = z.object({
  kelasId: z.number().int().positive().nullable().optional(),
  nama: z.string().min(1, 'Nama wajib diisi').max(100),
  nip: z.string().max(30).nullable().optional(),
  nomorHp: z.string().max(20).nullable().optional(),
  keterangan: z.string().max(255).nullable().optional()
})

export const updatePtkPendampingSchema = z.object({
  kelasId: z.number().int().positive().nullable().optional(),
  nama: z.string().min(1, 'Nama wajib diisi').max(100).optional(),
  nip: z.string().max(30).nullable().optional(),
  nomorHp: z.string().max(20).nullable().optional(),
  keterangan: z.string().max(255).nullable().optional()
})