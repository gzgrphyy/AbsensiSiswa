import { z } from 'zod'
import { dummyAvatarPath } from '../../utils/avatar'

const guruSchema = z.object({
  nama: z.preprocess(v => v === '' ? undefined : v, z.string().min(1, 'Nama tidak boleh kosong').max(100).optional()),
  email: z.string().email('Email tidak valid').max(150).optional(),
  foto: z.string().nullable().optional()
})

const siswaSchema = z.object({
  nama: z.preprocess(v => v === '' ? undefined : v, z.string().min(1).max(100).optional()),
  email: z.string().email('Email tidak valid').max(150).optional(),
  namaWali: z.string().max(100).nullable().optional(),
  kontakWali: z.string().max(20).nullable().optional(),
  foto: z.string().nullable().optional()
})

export default defineEventHandler(async (event) => {
  try {
    const session = await getUserSession(event)
    if (!session.user) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user) {
      await clearUserSession(event)
      throw createError({ statusCode: 401, statusMessage: 'Sesi berakhir, silakan login kembali' })
    }

    const body = await readBody(event)

    const resolveFoto = (foto: string | null) =>
      foto === null ? dummyAvatarPath(user.nama, user.jenisKelamin) : foto

    if (user.role === 'GURU' || user.role === 'ADMIN') {
      const parsed = guruSchema.parse(body)

      const updateData: Record<string, unknown> = {}
      if (parsed.nama) updateData.nama = parsed.nama
      if (parsed.email) {
        const existing = await prisma.user.findUnique({ where: { email: parsed.email } })
        if (existing && existing.id !== user.id) {
          throw createError({ statusCode: 400, statusMessage: 'Email sudah digunakan' })
        }
        updateData.email = parsed.email
      }
      if (parsed.foto !== undefined) updateData.foto = resolveFoto(parsed.foto)

      if (Object.keys(updateData).length > 0) {
        await prisma.user.update({ where: { id: user.id }, data: updateData })
        await replaceUserSession(event, {
          user: { ...session.user, ...updateData }
        })
      }

      return { success: true, message: 'Profil berhasil diperbarui' }
    }

    if (user.role === 'SISWA') {
      const parsed = siswaSchema.parse(body)

      const siswa = await prisma.siswa.findUnique({ where: { userId: user.id } })
      if (!siswa) {
        throw createError({ statusCode: 404, statusMessage: 'Data murid tidak ditemukan' })
      }

      const updateSiswa: Record<string, unknown> = {}
      if (parsed.nama) updateSiswa.nama = parsed.nama
      if (parsed.namaWali !== undefined) updateSiswa.namaWali = parsed.namaWali
      if (parsed.kontakWali !== undefined) updateSiswa.kontakWali = parsed.kontakWali

      if (Object.keys(updateSiswa).length > 0) {
        await prisma.siswa.update({ where: { userId: user.id }, data: updateSiswa })
      }

      const updateUser: Record<string, unknown> = {}
      if (parsed.foto !== undefined) updateUser.foto = resolveFoto(parsed.foto)
      if (parsed.email) {
        const existing = await prisma.user.findUnique({ where: { email: parsed.email } })
        if (existing && existing.id !== user.id) {
          throw createError({ statusCode: 400, statusMessage: 'Email sudah digunakan' })
        }
        updateUser.email = parsed.email
      }

      if (Object.keys(updateUser).length > 0) {
        await prisma.user.update({ where: { id: user.id }, data: updateUser })
        await replaceUserSession(event, {
          user: { ...session.user, ...updateUser }
        })
      }

      return { success: true, message: 'Profil berhasil diperbarui' }
    }

    return { success: true, message: 'Profil berhasil diperbarui' }
  } catch (err: any) {
    console.error('Profile PUT error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Gagal menyimpan profil',
    })
  }
})
