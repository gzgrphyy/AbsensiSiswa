export default defineEventHandler(async (event) => {
  let pengaturan = await prisma.pengaturan.findFirst()

  if (!pengaturan) {
    pengaturan = await prisma.pengaturan.create({
      data: {
        namaSekolah: 'SMK Negeri 1 Bandung',
        titelAplikasi: 'Sistem Absensi',
        namaAplikasi: 'Aplikasi Skoria',
      }
    })
  }

  return {
    ...pengaturan,
    tahunAjaran: pengaturan.tahunAjaran || '2026/2027',
    semester: pengaturan.semester || 'Ganjil',
  }
})
