export default defineEventHandler(async (event) => {
  let pengaturan = await prisma.pengaturan.findFirst()

  if (!pengaturan) {
    pengaturan = await prisma.pengaturan.create({
      data: {
        titelAplikasi: 'Sistem Absensi',
        namaAplikasi: 'Aplikasi Skoria',
      }
    })
  }

  return pengaturan
})
