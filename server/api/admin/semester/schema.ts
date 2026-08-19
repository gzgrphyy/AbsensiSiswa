import { z } from 'zod'

export const createSchema = z.object({
  nama: z.enum(['GANJIL', 'GENAP']),
  kodeAngka: z.number().int().positive().max(3999).optional().nullable(),
  pakaiRomawi: z.boolean().optional().default(false),
  setActive: z.boolean().optional().default(false),
  tanggalMulai: z.string().optional().nullable(),
  tanggalAkhir: z.string().optional().nullable()
}).superRefine((data, ctx) => {
  if (data.kodeAngka == null) return
  if (data.nama === 'GANJIL' && data.kodeAngka % 2 === 0) {
    ctx.addIssue({ code: 'custom', path: ['kodeAngka'], message: 'Kode/Angka harus angka ganjil untuk semester Ganjil' })
  }
  if (data.nama === 'GENAP' && data.kodeAngka % 2 !== 0) {
    ctx.addIssue({ code: 'custom', path: ['kodeAngka'], message: 'Kode/Angka harus angka genap untuk semester Genap' })
  }
})

export const updateSchema = z.object({
  nama: z.enum(['GANJIL', 'GENAP']).optional(),
  kodeAngka: z.number().int().positive().max(3999).optional().nullable(),
  pakaiRomawi: z.boolean().optional(),
  isActive: z.boolean().optional(),
  tanggalMulai: z.string().optional().nullable(),
  tanggalAkhir: z.string().optional().nullable()
})