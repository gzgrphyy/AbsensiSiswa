export const statusLabels: Record<string, string> = {
  PENDING: 'Menunggu',
  HADIR: 'Hadir',
  SAKIT: 'Sakit',
  IZIN: 'Izin',
  ALPHA: 'Alpha'
}

export const statusBadgeVariant: Record<string, string> = {
  PENDING: 'amber',
  HADIR: 'green',
  SAKIT: 'amber',
  IZIN: 'blue',
  ALPHA: 'red'
}

export const statusDotColor: Record<string, string> = {
  PENDING: 'bg-amber-400',
  HADIR: 'bg-green-500',
  SAKIT: 'bg-amber-500',
  IZIN: 'bg-blue-500',
  ALPHA: 'bg-red-500'
}
