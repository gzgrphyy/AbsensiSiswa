<script setup lang="ts">
import jsQR from 'jsqr'

const route = useRoute()

const hasCamera = ref(false)
const cameraError = ref('')
const scanning = ref(false)
const scanComplete = ref(false)
const manualCode = ref('')
const result = ref<{
  success: boolean
  alreadyScanned?: boolean
  message: string
  status?: string
  scannedAt?: string
  ruangan?: { id: number; nama: string }
  sesi?: { id: number; mapel: string; kelas: string; jamMulai?: string; jamSelesai?: string; guru?: string }
} | null>(null)
const errorMsg = ref('')
const submitting = ref(false)
const torchOn = ref(false)

const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const streamRef = ref<MediaStream | null>(null)
const animFrameId = ref(0)
const lastDetectTime = ref(0)

async function startCamera() {
  if (!import.meta.client) return
  cameraError.value = ''
  hasCamera.value = false
  scanning.value = false

  // Hentikan stream lama kalo ada
  stopCamera()

  // Urutan fallback kamera: environment -> user -> tanpa facingMode
  const attempts = [
    { facingMode: 'environment' as const, width: { ideal: 640 }, height: { ideal: 480 } },
    { facingMode: 'user' as const, width: { ideal: 640 }, height: { ideal: 480 } },
    { width: { ideal: 640 }, height: { ideal: 480 } }
  ]

  let stream = null
  let lastError: any = null

  for (const video of attempts) {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video, audio: false })
      if (stream) break
    } catch (err: any) {
      lastError = err
    }
  }

  if (!stream) {
    hasCamera.value = false
    scanning.value = false

    if (lastError?.name === 'NotAllowedError' || lastError?.name === 'PermissionDeniedError') {
      cameraError.value = 'Izin kamera ditolak. Izinkan akses kamera di pengaturan browser, lalu coba lagi.'
    } else if (lastError?.name === 'NotFoundError') {
      cameraError.value = 'Kamera tidak ditemukan di perangkat ini.'
    } else if (lastError?.name === 'NotReadableError') {
      cameraError.value = 'Kamera sedang digunakan aplikasi lain. Tutup aplikasi kamera lain, lalu coba lagi.'
    } else if (lastError?.name === 'SecurityError') {
      cameraError.value = 'Akses kamera butuh koneksi HTTPS. Gunakan ngrok untuk akses dari HP, atau masukkan kode manual.'
    } else {
      cameraError.value = 'Kamera tidak tersedia. Silakan masukkan kode QR secara manual.'
    }
    return
  }

  // Stream berhasil didapat
  streamRef.value = stream

  if (videoRef.value) {
    videoRef.value.srcObject = stream
    videoRef.value.setAttribute('playsinline', '')
    try {
      await videoRef.value.play()
    } catch {
      // Kadang play gagal kalo user belum interaksi
    }
  }

  // Tunggu video bener-bener jalan (max 3 detik)
  if (videoRef.value) {
    await Promise.race([
      new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          if (videoRef.value?.readyState && videoRef.value.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            clearInterval(interval)
            resolve()
          }
        }, 100)
      }),
      new Promise((resolve) => setTimeout(resolve, 3000))
    ])
  }

  hasCamera.value = true
  scanning.value = true
  scanComplete.value = false
  scanLoop()
}

function scanLoop() {
  if (!scanning.value || !videoRef.value || !canvasRef.value) return

  const video = videoRef.value
  const canvas = canvasRef.value

  if (video.readyState >= video.HAVE_CURRENT_DATA) {
    const vw = video.videoWidth
    const vh = video.videoHeight

    if (vw > 0 && vh > 0) {
      const scale = Math.min(640 / vw, 480 / vh, 1)
      const sw = Math.round(vw * scale)
      const sh = Math.round(vh * scale)

      canvas.width = sw
      canvas.height = sh
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (ctx) {
        ctx.drawImage(video, 0, 0, sw, sh)
        const imageData = ctx.getImageData(0, 0, sw, sh)

        const now = Date.now()
        if (now - lastDetectTime.value >= 300) {
          lastDetectTime.value = now
          try {
            const code = jsQR(imageData.data, imageData.width, imageData.height)
            if (code && code.data && !submitting.value && !scanComplete.value) {
              handleScan(code.data)
            }
          } catch { /* skip frame */ }
        }
      }
    }
  }

  animFrameId.value = requestAnimationFrame(scanLoop)
}

function stopCamera() {
  scanning.value = false
  if (animFrameId.value) {
    cancelAnimationFrame(animFrameId.value)
    animFrameId.value = 0
  }
  if (streamRef.value) {
    streamRef.value.getTracks().forEach(t => {
      t.stop()
      t.enabled = false
    })
    streamRef.value = null
  }
}

async function handleScan(code: string) {
  if (submitting.value || scanComplete.value) return
  submitting.value = true

  errorMsg.value = ''
  result.value = null

  let qrCode = code
  try {
    const url = new URL(code)
    const param = url.searchParams.get('code')
    if (param) qrCode = param
  } catch { /* plain text code */ }

  try {
    const res = await $fetch('/api/siswa/scan', {
      method: 'POST',
      body: { qrCode }
    })
    result.value = res as any
    scanComplete.value = true
    if (res.success) {
      stopCamera()
    }
  } catch (err: any) {
    errorMsg.value = err?.data?.statusMessage || 'Gagal melakukan absensi'
  } finally {
    submitting.value = false
  }
}

async function submitManual() {
  if (!manualCode.value.trim()) return
  await handleScan(manualCode.value.trim())
}

function resetScan() {
  result.value = null
  errorMsg.value = ''
  scanComplete.value = false
  submitting.value = false
  manualCode.value = ''
  startCamera()
}

function toggleTorch() {
  if (!streamRef.value) return
  const track = streamRef.value.getVideoTracks()[0]
  const caps = (track as any).getCapabilities?.()
  if (!caps?.torch) {
    torchOn.value = false
    return
  }
  torchOn.value = !torchOn.value
  ;(track as any).applyConstraints({
    advanced: [{ torch: torchOn.value }]
  }).catch(() => {
    torchOn.value = false
  })
}

onMounted(() => {
  const codeParam = route.query.code as string
  if (codeParam) {
    manualCode.value = codeParam
    handleScan(codeParam)
  } else {
    startCamera()
  }
})

onUnmounted(() => {
  stopCamera()
})

const statusBadgeVariant: Record<string, string> = {
  PENDING: 'amber',
  HADIR: 'green',
  SAKIT: 'red',
  IZIN: 'blue',
  ALPHA: 'gray'
}

const statusLabels: Record<string, string> = {
  PENDING: 'Menunggu Konfirmasi',
  HADIR: 'Hadir',
  SAKIT: 'Sakit',
  IZIN: 'Izin',
  ALPHA: 'Alpha'
}
</script>

<template>
  <AppLayout>
    <PageHeader
      title="Scan QR Absensi"
      description="Arahkan kamera ke QR Code ruangan untuk absen"
    />

    <div v-if="errorMsg && !result" class="max-w-lg mx-auto mb-4">
      <div class="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 flex items-start gap-2">
        <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ errorMsg }}</span>
      </div>
    </div>

    <div class="max-w-lg mx-auto">
      <BaseCard>
        <template v-if="!result && !scanComplete">
          <div v-if="cameraError && !hasCamera" class="text-center py-8 px-4">
            <div class="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
              <svg class="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p class="text-sm text-gray-700 mb-1">{{ cameraError }}</p>
            <div class="mt-3 flex flex-col gap-2 items-center">
              <button @click="startCamera"
                class="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors inline-flex items-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Coba Lagi
              </button>
              <p class="text-xs text-gray-400">Atau masukkan kode QR manual di bawah</p>
            </div>
          </div>

          <div v-if="!hasCamera && !cameraError" class="text-center py-12">
            <svg class="w-12 h-12 mx-auto text-gray-300 mb-3 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p class="text-sm text-gray-500">Mengakses kamera...</p>
          </div>

          <div v-if="hasCamera" class="relative">
            <div class="relative bg-black rounded-lg overflow-hidden">
              <video
                ref="videoRef"
                class="w-full h-72 sm:h-80 object-cover bg-black"
                autoplay
                playsinline
                muted
              ></video>
              <canvas ref="canvasRef" class="hidden"></canvas>

              <!-- QR frame overlay -->
              <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div class="relative w-48 h-48">
                  <div class="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-white rounded-tl"></div>
                  <div class="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-white rounded-tr"></div>
                  <div class="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-white rounded-bl"></div>
                  <div class="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-white rounded-br"></div>
                  <div class="absolute left-2 right-2 h-0.5 bg-green-400 shadow-lg shadow-green-400/50 animate-scan-line"></div>
                </div>
              </div>

              <div class="absolute top-3 left-3">
                <span class="text-xs text-white/80 bg-black/50 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  {{ submitting ? 'Memproses...' : 'Scan QR...' }}
                </span>
              </div>

              <button
                v-if="hasCamera"
                @click="toggleTorch"
                class="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors"
                title="Lampu kilat"
              >
                <svg v-if="!torchOn" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <svg v-else class="w-4 h-4 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
            </div>
          </div>

          <div class="border-t border-gray-100 pt-4 mt-4">
            <p class="text-xs text-gray-400 mb-2 inline-flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Kamera bermasalah? Masukkan kode QR secara manual:
            </p>
            <form @submit.prevent="submitManual" class="flex gap-2">
              <input
                v-model="manualCode"
                type="text"
                placeholder="Contoh: R-001"
                class="flex-1 px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 transition-shadow"
              />
              <button
                type="submit"
                :disabled="submitting || !manualCode.trim()"
                class="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1.5"
              >
                <svg v-if="submitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Absen
              </button>
            </form>
          </div>
        </template>

        <template v-if="result">
          <div class="text-center py-4">
            <div :class="result.success ? 'bg-green-100' : 'bg-red-100'"
              class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg v-if="result.success" class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg v-else class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>

            <h2 class="text-lg font-semibold text-gray-900 mb-2">
              {{ result.success ? 'Absensi Berhasil!' : 'Absensi Gagal' }}
            </h2>
            <p class="text-sm text-gray-600 mb-5">{{ result.message }}</p>

            <div v-if="result.ruangan || result.sesi" class="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-5 text-left space-y-2.5 text-sm">
              <div v-if="result.ruangan" class="flex justify-between items-center">
                <span class="text-gray-500">Ruangan</span>
                <span class="font-medium text-gray-900">{{ result.ruangan.nama }}</span>
              </div>
              <div v-if="result.sesi" class="flex justify-between items-center">
                <span class="text-gray-500">Mata Pelajaran</span>
                <span class="font-medium text-gray-900">{{ result.sesi.mapel }}</span>
              </div>
              <div v-if="result.sesi?.kelas" class="flex justify-between items-center">
                <span class="text-gray-500">Kelas</span>
                <span class="font-medium text-gray-900">{{ result.sesi.kelas }}</span>
              </div>
              <div v-if="result.sesi?.jamMulai" class="flex justify-between items-center">
                <span class="text-gray-500">Jam</span>
                <span class="font-medium text-gray-900">{{ result.sesi.jamMulai }} - {{ result.sesi.jamSelesai }}</span>
              </div>
              <div v-if="result.sesi?.guru" class="flex justify-between items-center">
                <span class="text-gray-500">Guru</span>
                <span class="font-medium text-gray-900">{{ result.sesi.guru }}</span>
              </div>
              <div v-if="result.status" class="flex justify-between items-center">
                <span class="text-gray-500">Status</span>
                <BaseBadge :variant="statusBadgeVariant[result.status] || 'gray'">
                  {{ statusLabels[result.status] || result.status }}
                </BaseBadge>
              </div>
              <div v-if="result.scannedAt" class="flex justify-between items-center">
                <span class="text-gray-500">Waktu</span>
                <span class="font-medium text-gray-900">{{ new Date(result.scannedAt).toLocaleTimeString('id-ID') }}</span>
              </div>
            </div>

            <div class="flex gap-2 justify-center">
              <NuxtLink to="/siswa"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors"
              >
                Kembali ke Beranda
              </NuxtLink>
              <button @click="resetScan"
                :disabled="submitting"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50"
              >
                {{ result.success ? 'Scan Lagi' : 'Coba Lagi' }}
              </button>
            </div>
          </div>
        </template>
      </BaseCard>

      <div class="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <div class="flex gap-2.5">
          <svg class="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p class="text-sm font-medium text-blue-800">Tips Scan QR</p>
            <ul class="mt-1 text-xs text-blue-700 space-y-1">
              <li>&bull; Pastikan ruangan cukup terang</li>
              <li>&bull; Arahkan kamera tepat ke QR Code</li>
              <li>&bull; Di HP: akses via <span class="font-mono bg-white px-1 rounded">https://</span> (pakai ngrok) agar kamera bisa dipakai</li>
              <li>&bull; Kode QR bisa dimasukkan manual jika kamera error</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
@keyframes scan-line {
  0%, 100% { top: 4px; }
  50% { top: calc(100% - 12px); }
}

.animate-scan-line {
  animation: scan-line 2s ease-in-out infinite;
}
</style>
