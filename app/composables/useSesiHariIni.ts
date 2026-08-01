export function useSesiHariIni() {
  const adaSesi = useState<boolean | null>('siswa-ada-sesi-hari-ini', () => null)

  const { data, refresh } = useFetch<{ adaSesi: boolean }>('/api/siswa/sesi-hari-ini', {
    key: 'siswa-sesi-hari-ini'
  })

  watch(data, (d) => {
    adaSesi.value = d?.adaSesi ?? null
  }, { immediate: true })

  return { adaSesi, refresh }
}
