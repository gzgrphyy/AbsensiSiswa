<script setup lang="ts">
import { jenisIzinLabels, statusIzinLabels, statusIzinBadgeVariant } from '~/utils/absensi'

interface ItemSiswa {
  id: number
  nisn: string
  nama: string
}

interface IzinItem {
  id: number
  tanggal: string
  jenis: string
  keterangan: string | null
  bukti: string | null
  status: string
  createdAt: string
  diresponPada: string | null
  siswa: ItemSiswa
  kelas: string
  penanggap: string | null
}

interface IzinData {
  kelasWali: { id: number; nama: string }[]
  pendingCount: number
  pending: IzinItem[]
  history: IzinItem[]
}

const { data, pending, refresh } = useFetch<IzinData>('/api/absensi/izin', { immediate: true })

const actingId = ref<number | null>(null)
const confirmTolak = ref<IzinItem | null>(null)
const errorMsg = ref('')
const successMsg = ref('')

const counts = computed(() => {
  const history = data.value?.history || []
  return {
    pending: data.value?.pendingCount || 0,
    disetujui: history.filter(h => h.status === 'DISETUJUI').length,
    ditolak: history.filter(h => h.status === 'DITOLAK').length
  }
})

function showError(msg: string) {
  errorMsg.value = msg
  setTimeout(() => { errorMsg.value = '' }, 5000)
}

function showSuccess(msg: string) {
  successMsg.value = msg
  setTimeout(() => { successMsg.value = '' }, 4000)
}

function tanggalLabel(tanggal: string) {
  return new Date(tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function waktuLabel(t: string | null) {
  if (!t) return ''
  return new Date(t).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

async function setujui(item: IzinItem) {
  actingId.value = item.id
  errorMsg.value = ''
  try {
    await $fetch(`/api/absensi/izin/${item.id}/respon`, { method: 'POST', body: { status: 'DISETUJUI' } })
    showSuccess(`Pengajuan ${item.siswa.nama} disetujui. Kehadiran pada tanggal tersebut telah diperbarui.`)
    await refresh()
  } catch (err: any) {
    showError(err?.data?.statusMessage || 'Gagal menyetujui pengajuan')
  } finally {
    actingId.value = null
  }
}

async function tolak(item: IzinItem) {
  actingId.value = item.id
  errorMsg.value = ''
  try {
    await $fetch(`/api/absensi/izin/${item.id}/respon`, { method: 'POST', body: { status: 'DITOLAK' } })
    showSuccess(`Pengajuan ${item.siswa.nama} ditolak. Kehadiran tidak diubah.`)
    confirmTolak.value = null
    await refresh()
  } catch (err: any) {
    showError(err?.data?.statusMessage || 'Gagal menolak pengajuan')
  } finally {
    actingId.value = null
  }
}
</script>

<template>
  <PTKLayout>
    <PageHeader title="Pengajuan Izin / Sakit" description="Persetujuan pengajuan dari murid" :show-back="false" />

    <Notification type="error" :message="errorMsg" :show="!!errorMsg" @dismiss="errorMsg = ''" />
    <Notification type="success" :message="successMsg" :show="!!successMsg" @dismiss="successMsg = ''" />

    <LoadingSkeleton v-if="pending" type="cards" :rows="3" />

    <template v-else>
      <!-- Statistik -->
      <div class="grid grid-cols-3 gap-3 mb-5">
        <div class="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
          <p class="text-xs font-medium text-amber-700 dark:text-amber-300">Pending</p>
          <p class="text-2xl font-extrabold text-amber-700 dark:text-amber-300 mt-1 leading-none">{{ counts.pending }}</p>
        </div>
        <div class="rounded-2xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4">
          <p class="text-xs font-medium text-green-700 dark:text-green-300">Disetujui</p>
          <p class="text-2xl font-extrabold text-green-700 dark:text-green-300 mt-1 leading-none">{{ counts.disetujui }}</p>
        </div>
        <div class="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
          <p class="text-xs font-medium text-red-700 dark:text-red-300">Ditolak</p>
          <p class="text-2xl font-extrabold text-red-700 dark:text-red-300 mt-1 leading-none">{{ counts.ditolak }}</p>
        </div>
      </div>

      <!-- Pending -->
      <section class="mb-6">
        <h2 class="text-base font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-3">Menunggu Persetujuan</h2>

        <div v-if="data?.pending.length === 0" class="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-card dark:shadow-dark-card px-5 py-8 text-center">
          <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">Tidak ada pengajuan menunggu persetujuan</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="item in data.pending"
            :key="item.id"
            class="rounded-2xl border border-gray-200 dark:border-slate-700 border-l-4 border-l-amber-400 bg-white dark:bg-slate-800 shadow-card dark:shadow-dark-card p-5"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="font-semibold text-gray-900 dark:text-gray-100 truncate">{{ item.siswa.nama }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">NISN {{ item.siswa.nisn }} · Kelas {{ item.kelas }}</p>
              </div>
              <div class="flex items-center gap-1.5 flex-shrink-0">
                <BaseBadge :variant="item.jenis === 'SAKIT' ? 'amber' : 'blue'" size="sm">
                  {{ jenisIzinLabels[item.jenis] || item.jenis }}
                </BaseBadge>
                <BaseBadge variant="amber" size="sm" pulse>{{ statusIzinLabels.PENDING }}</BaseBadge>
              </div>
            </div>

            <p class="text-sm text-gray-700 dark:text-gray-300 mt-3">
              {{ tanggalLabel(item.tanggal) }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1.5">{{ item.keterangan }}</p>

            <a
              v-if="item.bukti"
              :href="item.bukti"
              target="_blank"
              rel="noopener"
              class="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Lihat Bukti
            </a>

            <div class="flex gap-2.5 mt-4">
              <button
                type="button"
                :disabled="actingId === item.id"
                @click="setujui(item)"
                class="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-green-500 rounded-xl hover:bg-green-600 active:bg-green-700 disabled:opacity-50 transition-colors shadow-md shadow-green-500/30 inline-flex items-center justify-center gap-1.5"
              >
                <svg v-if="actingId === item.id" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Setujui
              </button>
              <button
                type="button"
                :disabled="actingId === item.id"
                @click="confirmTolak = item"
                class="px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50 transition-colors inline-flex items-center gap-1.5"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Tolak
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Riwayat -->
      <section>
        <h2 class="text-base font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-3">Riwayat Pengajuan</h2>

        <div v-if="data?.history.length === 0" class="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-card dark:shadow-dark-card px-5 py-8 text-center">
          <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">Belum ada riwayat pengajuan</p>
        </div>

        <div v-else class="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-card dark:shadow-dark-card overflow-hidden divide-y divide-gray-100 dark:divide-slate-700">
          <div v-for="item in data.history" :key="item.id" class="px-5 py-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{{ item.siswa.nama }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ tanggalLabel(item.tanggal) }}</p>
                <p v-if="item.keterangan" class="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{{ item.keterangan }}</p>
                <p v-if="item.penanggap && item.diresponPada" class="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5">
                  Diproses oleh {{ item.penanggap }} · {{ waktuLabel(item.diresponPada) }}
                </p>
              </div>
              <div class="flex items-center gap-1.5 flex-shrink-0">
                <BaseBadge :variant="item.jenis === 'SAKIT' ? 'amber' : 'blue'" size="sm">
                  {{ jenisIzinLabels[item.jenis] || item.jenis }}
                </BaseBadge>
                <BaseBadge :variant="statusIzinBadgeVariant[item.status] || 'gray'" size="sm">
                  {{ statusIzinLabels[item.status] || item.status }}
                </BaseBadge>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>

    <ConfirmDialog
      :show="!!confirmTolak"
      title="Tolak Pengajuan"
      :message="`Tolak pengajuan ${confirmTolak?.siswa.nama} (${confirmTolak?.jenis === 'SAKIT' ? 'Sakit' : 'Izin'}) pada ${confirmTolak ? tanggalLabel(confirmTolak.tanggal) : ''}. Kehadiran siswa tidak akan diubah.`"
      variant="danger"
      confirm-label="Ya, Tolak"
      :loading="actingId === confirmTolak?.id"
      @confirm="confirmTolak && tolak(confirmTolak)"
      @cancel="confirmTolak = null"
    />
  </PTKLayout>
</template>