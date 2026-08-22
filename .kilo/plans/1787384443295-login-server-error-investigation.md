# Diagnosa & Perbaikan Server Error saat Login

## Ringkasan Masalah
User mengalami "server error" saat submit form login (`POST /api/auth/login`).

## Hipotesis (urut prioritas)

### 1. Bug `nuxt-auth-utils` v0.5.29 — session password tertimpa `""`
**Bukti:**
- `nuxt-auth-utils@0.5.29` menginisialisasi `runtimeConfig.session.password = ""` (default).
- Di `_useSession()`: `sessionConfig = defu({ password: process.env[envSessionPassword] }, runtimeConfig.session)` — urutan `defu` menyebabkan `password: ""` dari `runtimeConfig.session` menimpa password dari `.env`.
- Akibat: `useSession(event, finalConfig)` dipanggil dengan `password: ""`, lalu `h3`/`jose` gagal decrypt/encrypt session → 500 Internal Server Error.

### 2. Database belum di-migrate atau MySQL belum berjalan
- Jika tabel `users` belum ada, `prisma.user.findUnique()` melempar error → 500.
- Jika MySQL tidak berjalan, Prisma gagal konek → 500.

### 3. Password hash di DB tidak sesuai format
- `verifyPassword()` mengembalikan `false` (bukan error) jika format hash salah, jadi ini menghasilkan 401, bukan 500. **Kemungkinan kecil.**

## Langkah Verifikasi

1. Cek output console terminal tempat `npm run dev` dijalankan — cari stack trace yang dimulai dari `setUserSession` / `useSession` / `jose`.
2. Cek apakah MySQL berjalan: `mysql -u root -p` (password kosong sesuai `DATABASE_URL`).
3. Cek apakah tabel `users` sudah ada: `SHOW TABLES;` di DB `absensi_dev`.
4. Cek apakah ada user di tabel `users`: `SELECT email, passwordHash FROM users LIMIT 1;`.

## Langkah Perbaikan

### Prioritas A — Perbaiki `nuxt-auth-utils` password issue
**Opsi 1 (paling aman):** Set `runtimeConfig.session.password` secara eksplisit di `nuxt.config.ts` agar tidak tertimpa default `""`:

```ts
runtimeConfig: {
    session: {
      password: process.env.NUXT_SESSION_PASSWORD || "fallback-only-for-dev",
      cookie: {
        secure: false
      }
    }
  },
```

**Opsi 2:** Upgrade `nuxt-auth-utils` ke versi terbaru yang sudah memperbaiki urutan `defu`:
```bash
npm install nuxt-auth-utils@latest
```

### Prioritas B — Pastikan database siap
```bash
npx prisma migrate deploy
npm run db:seed
```

### Prioritas C — Verifikasi login
- Setelah perbaikan, restart `npm run dev`.
- Test login dengan kredensial seed:
  - Admin: `admin@absensi.test` / `Admin123`
  - Guru: `muhammad.ahmad.fauzi@sekolah.sch.id` / `Guru123`
  - Siswa: `siswa1@absensi.test` / `Siswa123`

## File Terkait
- `nuxt.config.ts` — konfigurasi session & devServer
- `server/api/auth/login.post.ts` — endpoint login
- `server/utils/password.ts` — hash/verify password
- `prisma/schema.prisma` — schema User
- `.env` — `DATABASE_URL` & `NUXT_SESSION_PASSWORD`
