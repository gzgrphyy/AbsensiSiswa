const dummyAvatarsLaki = [
  '/images/avatars/laki-1.svg',
  '/images/avatars/laki-2.svg',
  '/images/avatars/laki-3.svg',
]

const dummyAvatarsPerempuan = [
  '/images/avatars/perempuan-1.svg',
  '/images/avatars/perempuan-2.svg',
  '/images/avatars/perempuan-3.svg',
]

export function dummyAvatarPath(seed: string, jenisKelamin: string | null | undefined): string {
  const list = jenisKelamin === 'PEREMPUAN' ? dummyAvatarsPerempuan : dummyAvatarsLaki
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return list[hash % list.length]
}