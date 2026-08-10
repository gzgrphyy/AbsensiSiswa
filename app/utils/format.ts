export function capitalize(value: string | null | undefined): string {
  if (!value) return ''
  return value
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
