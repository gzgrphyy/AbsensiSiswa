export default defineEventHandler(async (event) => {
  return {
    umum: {
      namaSekolah: 'SMK Negeri 1 Bandung',
      alamat: 'Jl. Merdeka No. 123, Bandung',
      telp: '022-1234567',
      email: 'info@smkn1bdg.sch.id',
      kepalaSekolah: 'Drs. H. Agus Salim, M.Pd.',
      nipKepsek: '196501011990011001',
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
