<script setup lang="ts">
const route = useRoute()
const { user } = useUserSession()

const hasCamera = ref(false)
const scanning = ref(false)
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
const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const streamRef = ref<MediaStream | null>(null)

const barcodeSupported = import.meta.client && 'BarcodeDetector' in window

async function startCamera() {
  if (!import.meta.client) return
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: 640, height: 480 }
    })
    streamRef.value = stream
    if (videoRef.value) {
      videoRef.value.srcObject = stream
      await videoRef.value.play()
    }
    hasCamera.value = true
    scanning.value = true
    scanLoop()
  } catch {
    hasCamera.value = false
    scanning.value = false
    errorMsg.value = 'Kamera tidak tersedia. Silakan masukkan kode QR secara manual.'
  }
}

function scanLoop() {
  if (!scanning.value || !videoRef.value || !canvasRef.value) return

  const video = videoRef.value
  const canvas = canvasRef.value

  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      try {
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] })
        detector.detect(canvas).then((barcodes: any[]) => {
          if (barcodes.length > 0 && !submitting.value) {
            const code = barcodes[0].rawValue
            handleScan(code)
          }
        }).catch(() => {})
      } catch { /* continue */ }
    }
  }

  if (scanning.value) {
    requestAnimationFrame(scanLoop)
  }
}

function stopCamera() {
  scanning.value = false
  if (streamRef.value) {
    streamRef.value.getTracks().forEach(t => t.stop())
    streamRef.value = null
  }
}

async function handleScan(code: string) {
  if (submitting.value) return
  submitting.value = true
  errorMsg.value = ''
  result.value = null

  // Extract code from URL if full URL was scanned
  let qrCode = code
  try {
    const url = new URL(code)
    const param = url.searchParams.get('code')
    if (param) qrCode = param
  } catch {}

  try {
    const res = await $fetch('/api/siswa/scan', {
      method: 'POST',
      body: { qrCode }
    })
    result.value = res as any
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

onMounted(() => {
  // Check if code param is in URL (direct scan via camera app)
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

const statusLabels: Record<string, string> = {
  PENDING: 'Menunggu Konfirmasi',
  HADIR: 'Hadir',
  SAKIT: 'Sakit',
  IZIN: 'Izin',
  ALPHA: 'Alpha'
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
  HADIR: 'bg-green-100 text-green-700 border-green-200',
  SAKIT: 'bg-red-100 text-red-700 border-red-200',
  IZIN: 'bg-blue-100 text-blue-700 border-blue-200',
  ALPHA: 'bg-gray-100 text-gray-600 border-gray-200'
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
    <header class="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/60 sticky top-0 z-30">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <NuxtLink to="/siswa" class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </NuxtLink>
          <div>
            <h1 class="text-lg font-semibold text-gray-900">Scan QR Absensi</h1>
            <p class="text-sm text-gray-500">Arahkan kamera ke QR Code ruangan</p>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <!-- Error -->
        <Transition name="fade">
          <div v-if="errorMsg" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <span class="flex-1">{{ errorMsg }}</span>
            <button @click="errorMsg = ''" class="p-0.5 hover:bg-red-100 rounded"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
        </Transition>

        <!-- Scanner -->
        <div v-if="!result">
          <div v-if="!hasCamera && scanning === false && !errorMsg" class="text-center py-8">
            <p class="text-gray-500">Memeriksa kamera...</p>
          </div>

          <div v-if="hasCamera" class="relative mb-4">
            <video ref="videoRef" class="w-full rounded-xl border border-gray-200 bg-black" playsinline></video>
            <canvas ref="canvasRef" class="hidden"></canvas>
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div class="w-48 h-48 border-2 border-white/70 rounded-xl"></div>
            </div>
            <div class="absolute bottom-3 left-0 right-0 text-center">
              <span class="text-xs text-white/70 bg-black/40 px-3 py-1 rounded-full">Mendeteksi QR Code...</span>
            </div>
          </div>

          <button v-if="!hasCamera && !errorMsg" @click="startCamera"
            class="w-full mb-4 px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 inline-flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Aktifkan Kamera
          </button>

          <!-- Manual Input -->
          <div class="border-t border-gray-100 pt-4 mt-2">
            <p class="text-xs text-gray-400 mb-2">Atau masukkan kode QR secara manual:</p>
            <form @submit.prevent="submitManual" class="flex gap-2">
              <input v-model="manualCode" type="text" placeholder="Masukkan kode QR"
                class="flex-1 px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400" />
              <button type="submit" :disabled="submitting || !manualCode.trim()"
                class="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 inline-flex items-center gap-1.5">
                <svg v-if="submitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Scan
              </button>
            </form>
          </div>
        </div>

        <!-- Result -->
        <Transition name="slide">
          <div v-if="result" class="text-center">
            <div :class="result.success ? 'bg-green-100' : 'bg-red-100'"
              class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg v-if="result.success" class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg v-else class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>

            <h2 class="text-xl font-semibold text-gray-900 mb-2">
              {{ result.success ? 'Absensi Berhasil!' : 'Absensi Ditolak' }}
            </h2>
            <p class="text-gray-600 mb-4">{{ result.message }}</p>

            <div v-if="result.ruangan || result.sesi" class="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-4 text-left space-y-2 text-sm">
              <div v-if="result.ruangan" class="flex justify-between">
                <span class="text-gray-500">Ruangan</span>
                <span class="font-medium text-gray-900">{{ result.ruangan.nama }}</span>
              </div>
              <div v-if="result.sesi" class="flex justify-between">
                <span class="text-gray-500">Mata Pelajaran</span>
                <span class="font-medium text-gray-900">{{ result.sesi.mapel }}</span>
              </div>
              <div v-if="result.sesi?.kelas" class="flex justify-between">
                <span class="text-gray-500">Kelas</span>
                <span class="font-medium text-gray-900">{{ result.sesi.kelas }}</span>
              </div>
              <div v-if="result.sesi?.guru" class="flex justify-between">
                <span class="text-gray-500">Guru</span>
                <span class="font-medium text-gray-900">{{ result.sesi.guru }}</span>
              </div>
              <div v-if="result.status" class="flex justify-between">
                <span class="text-gray-500">Status</span>
                <span :class="statusColors[result.status] || 'bg-gray-100 text-gray-600'"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {{ statusLabels[result.status] || result.status }}
                </span>
              </div>
            </div>

            <div v-if="result.success" class="flex gap-2 justify-center">
              <NuxtLink to="/siswa"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                Kembali ke Dashboard
              </NuxtLink>
              <button @click="result = null; errorMsg = ''; startCamera()"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                Scan Lagi
              </button>
            </div>
            <div v-else>
              <button @click="result = null; errorMsg = ''; startCamera()"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                Coba Lagi
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </main>
  </div>
</template>

<style scoped>
.slide-enter-active { transition: all 0.3s ease-out; }
.slide-leave-active { transition: all 0.2s ease-in; }
.slide-enter-from { transform: translateY(-10px); opacity: 0; }
.slide-leave-to { transform: translateY(-10px); opacity: 0; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
