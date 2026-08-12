export function hexToRgb(hex: string): [number, number, number] | null {
  let value = hex.trim().replace('#', '')
  if (value.length === 3) {
    value = value.split('').map(c => c + c).join('')
  }
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return null
  const num = parseInt(value, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

function mixWhite(rgb: [number, number, number], ratio: number): [number, number, number] {
  return [
    Math.round(rgb[0] + (255 - rgb[0]) * ratio),
    Math.round(rgb[1] + (255 - rgb[1]) * ratio),
    Math.round(rgb[2] + (255 - rgb[2]) * ratio),
  ]
}

function mixBlack(rgb: [number, number, number], ratio: number): [number, number, number] {
  return [
    Math.round(rgb[0] * (1 - ratio)),
    Math.round(rgb[1] * (1 - ratio)),
    Math.round(rgb[2] * (1 - ratio)),
  ]
}

export function generatePrimaryScale(baseHex: string): Record<string, string> {
  const base = hexToRgb(baseHex) || [10, 102, 160]
  return {
    '--primary-50': mixWhite(base, 0.9).join(' '),
    '--primary-100': mixWhite(base, 0.75).join(' '),
    '--primary-200': mixWhite(base, 0.55).join(' '),
    '--primary-300': mixWhite(base, 0.35).join(' '),
    '--primary-400': mixWhite(base, 0.15).join(' '),
    '--primary-500': base.join(' '),
    '--primary-600': mixBlack(base, 0.15).join(' '),
    '--primary-700': mixBlack(base, 0.3).join(' '),
    '--primary-800': mixBlack(base, 0.45).join(' '),
    '--primary-900': mixBlack(base, 0.6).join(' '),
  }
}

/**
 * Mengeset --primary-* (navbar, sidebar, tombol, dll.)
 * sekaligus --admin-accent-* khusus untuk garis tabel & icon beranda.
 * Logo background pakai warna fixed (bukan primary) — lihat komponen.
 */
export function applyPrimaryColor(hex: string) {
  if (!import.meta.client) return
  const rgb = hexToRgb(hex) || [10, 102, 160]
  const scale = generatePrimaryScale(hex)
  const root = document.documentElement

  // Set --primary-* agar navbar, sidebar, tombol, dll. ikut warna
  for (const [key, value] of Object.entries(scale)) {
    root.style.setProperty(key, value)
  }

  // Set --admin-accent-* khusus garis tabel & icon beranda
  root.style.setProperty('--admin-accent',       rgb.join(' '))
  root.style.setProperty('--admin-accent-light', mixWhite(rgb, 0.85).join(' '))
  root.style.setProperty('--admin-accent-dark',  mixBlack(rgb, 0.2).join(' '))
}
