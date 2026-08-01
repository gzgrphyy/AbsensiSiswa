export function useJadwalHariIni() {
  const adaJadwal = useState<boolean | null>('ptk-ada-jadwal-hari-ini', () => null)

  const { data, refresh } = useFetch<any[]>('/api/absensi/jadwal-hari-ini', {
    key: 'ptk-jadwal-hari-ini'
  })

  watch(data, (d) => {
    adaJadwal.value = Array.isArray(d) ? d.length > 0 : null
  }, { immediate: true })

  return { adaJadwal, refresh }
}
