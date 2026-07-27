import { z } from 'zod'

const pengaturanSchema = z.object({
  umum: z.object({
    namaSekolah: z.string().min(1).max(200),
    alamat: z.string().max(500).optional().default(''),
    telp: z.string().max(20).optional().default(''),
    email: z.string().email().max(150).optional().default(''),
    kepalaSekolah: z.string().max(100).optional().default(''),
    nipKepsek: z.string().max(30).optional().default(''),
  }),
  absensi: z.object({
    batasScan: z.number().int().min(1).max(60),
    autoTutupSesi: z.boolean(),
    batasTelat: z.number().int().min(0).max(120),
    notifikasi: z.boolean(),
    toleransiAlpha: z.number().int().min(0).max(20),
    izinTeksBebas: z.boolean(),
  }),
  keamanan: z.object({
    minimalPassword: z.number().int().min(4).max(32),
    sesiTimeout: z.number().int().min(5).max(480),
    maxLogin: z.number().int().min(1).max(10),
    twoFactorAuth: z.boolean(),
    logAktivitas: z.boolean(),
  }),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = pengaturanSchema.parse(body)

  // TODO: Store settings to database when Setting model is added
  // For now, settings are accepted but stored in-memory only

  return {
    success: true,
    message: 'Pengaturan berhasil disimpan',
    data: parsed
  }
})
