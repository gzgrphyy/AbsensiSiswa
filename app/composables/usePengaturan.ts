interface PengaturanData {
  id: number
  namaSekolah: string
  logoSekolahPath: string | null
  alamat: string
  telp: string
  email: string
  tahunAjaran: string
  semester: string
  kepalaSekolah: string
  nipKepsek: string
  warnaUtama: string
  titelAplikasi: string
  namaAplikasi: string
  faviconPath: string | null
  iconPath: string | null
  logoDinasPath: string | null
  logoKotaPath: string | null
  logoProvinsiPath: string | null
}

// Shared state across components using Nuxt's useState
const pengaturanState = /* #__PURE__ */ () => useState<PengaturanData | null>('pengaturan', () => null)
const loadingState = /* #__PURE__ */ () => useState<boolean>('pengaturan-loading', () => false)

export function usePengaturan() {
  const pengaturan = pengaturanState()
  const loading = loadingState()

  async function fetch() {
    loading.value = true
    try {
      pengaturan.value = await $fetch('/api/pengaturan')
    } catch (e: any) {
      // silent fail - will use defaults
    } finally {
      loading.value = false
    }
  }

  function setData(data: PengaturanData) {
    pengaturan.value = data
  }

  async function save(data: Partial<PengaturanData>) {
    loading.value = true
    try {
      const res = await $fetch<{ success: boolean; message: string; data: PengaturanData }>('/api/admin/pengaturan', {
        method: 'PUT',
        body: data,
      })
      pengaturan.value = res.data
      return res
    } catch (e: any) {
      throw e
    } finally {
      loading.value = false
    }
  }

  return { pengaturan, loading, fetch, setData, save }
}
