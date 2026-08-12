export default defineEventHandler(async (event) => {
  const branding = await prisma.pengaturan.findFirst()

  return {
    umum: {
      namaSekolah: branding?.namaSekolah || 'SMK Negeri 1 Bandung',
      logoSekolahPath: branding?.logoSekolahPath || null,
      alamat: branding?.alamat || 'Jl. Merdeka No. 123, Bandung',
      telp: branding?.telp || '022-1234567',
      email: branding?.email || 'info@smkn1bdg.sch.id',
      tahunAjaran: branding?.tahunAjaran || '2026/2027',
      semester: branding?.semester || 'Ganjil',
      kepalaSekolah: branding?.kepalaSekolah || 'Drs. H. Agus Salim, M.Pd.',
      nipKepsek: branding?.nipKepsek || '196501011990011001',
    },
    branding: branding ? {
      namaAplikasi: branding.namaAplikasi,
      titelAplikasi: branding.titelAplikasi,
      iconPath: branding.iconPath,
      faviconPath: branding.faviconPath,
      warnaUtama: branding.warnaUtama,
    } : {
      namaAplikasi: 'Aplikasi Skoria',
      titelAplikasi: 'EduPresensi | Sistem Absensi Digital',
      iconPath: null,
      faviconPath: null,
      warnaUtama: '#0A66A0',
    },
    absensi: {
      batasScan: 10,
      autoTutupSesi: true,
      batasTelat: 15,
      notifikasi: true,
      toleransiAlpha: 3,
      izinTeksBebas: false,
    },
    keamanan: {
      minimalPassword: 8,
      sesiTimeout: 60,
      maxLogin: 3,
      twoFactorAuth: false,
      logAktivitas: true,
    }
  }
})
