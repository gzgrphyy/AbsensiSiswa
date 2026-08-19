export type SemesterNama = 'GANJIL' | 'GENAP'

export type SemesterInfo = {
  nama: string
  kodeAngka?: number | null
  pakaiRomawi?: boolean
}

export function toRoman(n: number): string {
  if (n < 1 || n > 3999) return String(n)
  const table: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ]
  let result = ''
  for (const [value, symbol] of table) {
    while (n >= value) {
      result += symbol
      n -= value
    }
  }
  return result
}

export function semesterDefaultAngka(nama: string): number {
  return nama === 'GENAP' ? 2 : 1
}

export function semesterAngka(item: SemesterInfo): number {
  return item.kodeAngka ?? semesterDefaultAngka(item.nama)
}

export function semesterDisplayAngka(item: SemesterInfo): string {
  const angka = semesterAngka(item)
  return item.pakaiRomawi ? toRoman(angka) : String(angka)
}

export function semesterFullLabel(item: SemesterInfo, t: (key: string) => string): string {
  const label = item.nama === 'GENAP' ? t('semester.genap') : t('semester.ganjil')
  return `${label} · ${semesterDisplayAngka(item)}`
}