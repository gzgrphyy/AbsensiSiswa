# Plan: Redesign Admin Monitoring Page Cards

## Context
Redesign the two symmetric stat cards on `app/pages/admin/monitoring/index.vue` into two asymmetric cards: "Ruangan Aktif" (left, wider) and "Partisipasi Hari Ini" (right, narrower). Remove the existing "Sudah Absen" and "Belum Absen" total cards since that data is already visible per-row in the table below.

## Decisions

### 1. API Response Shape
The API currently returns `MonitoringItem[]`. Change it to return an object so the frontend receives pre-computed aggregates without duplicating active-session filtering logic:

```ts
// server/api/admin/monitoring/index.get.ts
interface MonitoringResponse {
  rooms: MonitoringItem[]
  totalRuangan: number
  totalSesiAktif: number
  totalMuridAktif: number
  totalSudahAbsenAktif: number
  partisipasiPersen: number
}
```

**Active-only aggregates logic** (added inside the API, after the existing per-room loop):
- `totalSesiAktif` = sum of `sesiAktif` across all rooms
- `totalMuridAktif` = sum of students from only `AKTIF` sessions per room (distinct classes per room, same dedup logic as existing `totalSiswa`)
- `totalSudahAbsenAktif` = sum of `requests.length` from only `AKTIF` sessions per room
- `partisipasiPersen` = `totalMuridAktif > 0 ? round(totalSudahAbsenAktif / totalMuridAktif * 100) : 0`

Keep the existing per-room `MonitoringItem` fields unchanged for the table.

### 2. CSS Variables
Add to `:root` in `app/assets/css/main.css`:

```css
--surface-1: 249 250 251;     /* very light gray (#f9fafb) */
--fill-success: 34 197 94;    /* green-500 for live dot */
--text-accent: var(--admin-accent);   /* alias for existing admin accent */
--fill-accent: var(--admin-accent);   /* alias for existing admin accent */
```

Dark mode: `--surface-1` is overridden by `dark:bg-slate-800` in the template, so no dark-mode CSS variable change needed.

### 3. i18n Keys
Add to both `i18n/locales/id.json` and `i18n/locales/en.json` under `admin.monitoring`:

```json
"statRuanganAktif": "Ruangan Aktif",        // ID: "Ruangan Aktif", EN: "Active Rooms"
"statPartisipasiHariIni": "Partisipasi Hari Ini", // ID/EN same label
"dari": "dari"                               // ID: "dari", EN: "of"
```

The "X dari Y" format uses the new `dari` key.

### 4. Frontend Changes (`app/pages/admin/monitoring/index.vue`)

**Interface / fetch:**
- Replace `MonitoringItem[]` fetch type with the new response object type
- `displayData` becomes `data.value?.rooms || []`
- Add computed: `totalRuangan`, `totalSesiAktif`, `partisipasiPersen`
- Remove `totalSudahAbsen` and `totalBelumAbsen` computed properties

**Grid:**
Replace `grid-cols-1 sm:grid-cols-2` with `grid-cols-1 sm:grid-cols-[1.3fr_1fr]`

**Left card — "Ruangan Aktif":**
- Remove old `StatCard` usage
- Inline card with:
  - `rounded-lg bg-[var(--surface-1)] dark:bg-slate-800 p-4`
  - Top row: live dot (`w-[7px] h-[7px] rounded-full bg-[var(--fill-success)] animate-pulse`) + label + `ti-broadcast` SVG icon on the right
  - Value: `{{ totalSesiAktif }} <span class="text-sm text-gray-400">{{ t('common.dari') }} {{ totalRuangan }}</span>`

**Right card — "Partisipasi Hari Ini":**
- Inline card with same flat styling
- Label + large percentage number using `text-[var(--text-accent)]` via `style="color: rgb(var(--text-accent))"`
- Thin 6px progress bar below:
  - Track: `h-[6px] rounded-full bg-gray-200 dark:bg-slate-700`
  - Fill: `h-full rounded-full` with `:style="{ width: partisipasiPersen + '%', backgroundColor: 'rgb(var(--fill-accent))' }"`

### 5. Broadcast Icon
Use inline SVG matching Tabler `ti-broadcast` path (no icon library dependency):

```svg
<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
  <circle cx="12" cy="12" r="2" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1" />
</svg>
```

## Files to Modify
1. `server/api/admin/monitoring/index.get.ts`
2. `app/pages/admin/monitoring/index.vue`
3. `app/assets/css/main.css`
4. `i18n/locales/id.json`
5. `i18n/locales/en.json`

## Validation
1. Run `npm run lint` or equivalent to verify no syntax errors
2. Verify the monitoring page loads and shows two asymmetric cards
3. Verify the live dot animates (pulse) on the left card
4. Verify the progress bar reflects the correct participation percentage
5. Verify the table still shows per-room data correctly
6. Verify dark mode renders cards with `dark:bg-slate-800`
