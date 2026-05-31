# SmartTransit Final Project

SmartTransit adalah aplikasi dashboard realtime untuk pemantauan armada transportasi massal. Proyek ini dibangun dengan Next.js App Router, React 19, dan Leaflet untuk visualisasi peta.

## Menjalankan aplikasi

- `npm install`
- `npm run dev`
- Buka `http://localhost:3000`

## Ringkasan arsitektur

- Frontend: Next.js 15 App Router dengan React 19
- Peta realtime: `react-leaflet` + `leaflet`
- Data mock / API internal: folder `app/api`
- Logika domain: folder `lib`
- Komponen UI terpisah: folder `components`

## Struktur utama

### Root

- `package.json` - definisi dependency dan script Next.js
- `next.config.ts` - konfigurasi Next.js
- `tsconfig.json` - konfigurasi TypeScript
- `next-env.d.ts` - environment type definitions untuk Next
- `PRD.md` - dokumen produk / requirement

### `app/`

- `layout.tsx` - layout global, memuat `TopNav` dan `globals.css`
- `page.tsx` - halaman beranda yang merender `DashboardShell`
- `corridor/[id]/page.tsx` - halaman detail koridor untuk route dinamis
- `developer/page.tsx` - halaman developer hand-off dengan contoh payload API
- `monitoring/page.tsx` - halaman monitoring armada dan halte

### `app/api/`

- `eta/route.ts` - endpoint ETA traffic-aware
- `gps/stream/route.ts` - Server-Sent Events (SSE) untuk update posisi GPS tiap 3 detik
- `gps/current/route.ts` - snapshot GPS saat ini
- `density/current/route.ts` - snapshot kepadatan saat ini
- `density/hourly/route.ts` - data kepadatan per jam untuk analitik historis
- `intermodal/evaluate/route.ts` - evaluasi intermodal / transfer (detail implementasi internal)
- `dashboard/route.ts` - agregasi data dashboard internal

### `components/`

Folder komponen UI utama. Setiap file umumnya menyajikan satu bagian halaman atau widget:

- `accordion-card.tsx` - komponen accordion untuk panel developer
- `api-reference.tsx` - ringkasan payload API dan contoh respons
- `copy-button.tsx` - tombol untuk menyalin JSON ke clipboard
- `corridor-detail-shell.tsx` - shell halaman detail koridor
- `corridor-unit-timeline.tsx` - timeline unit operasional per koridor
- `dashboard-shell.tsx` - halaman dashboard utama dengan filter, KPI, feeder, dan ETA
- `developer-shell.tsx` - halaman dokumentasi API internal untuk developer
- `eta-panel.tsx` - panel ringkasan ETA dan konektivitas intermodal
- `feeder-panel.tsx` - panel prediksi feeder dan kepadatan
- `filters-bar.tsx` - kontrol filter tanggal, koridor, crowding, prioritas
- `halte-detail-shell.tsx` - shell halaman detail halte / stop
- `hourly-bars.tsx` - grafik batang kepadatan per jam
- `map-panel.tsx` - panel peta yang memuat `RealtimeMapClient`
- `metric-card.tsx` - kartu KPI kecil untuk ringkasan metrik
- `monitoring-shell.tsx` - halaman monitoring GPS, station timeline, dan tracking
- `realtime-map-client.tsx` - map interaktif Leaflet dengan kendaraan dan stasiun
- `station-timeline.tsx` - daftar dan progres halte/stasiun
- `top-nav.tsx` - navigasi atas aplikasi
- `use-gps-stream.ts` - hook client-side untuk menghubungkan EventSource ke `/api/gps/stream`

### `lib/`

Library domain dan sumber data mock:

- `types.ts` - definisi tipe TypeScript untuk dashboard, GPS, ETA, density, dan filter
- `mock-data.ts` - generator data mock, snapshot GPS, density, dan contoh respons API
- `data-source.ts` - pembangun state dashboard dari filter dan sumber data mock
- `predict.ts` - fungsi prediksi ETA, crowding label, feeder recommendation, dan evaluasi transfer

## Halaman utama

1. `app/page.tsx`
   - Render `DashboardShell` dengan data awal dari `createInitialDashboardState()`
   - Fokus pada operasi koridor, prediksi feeder, dan status kepadatan

2. `app/corridor/[id]/page.tsx`
   - Render `CorridorDetailShell` untuk detail satu koridor
   - Menampilkan timeline unit, delay terpropagasi, dan ETA per koridor

3. `app/developer/page.tsx`
   - Render `DeveloperShell` untuk dokumentasi API internal
   - Menyediakan contoh payload JSON untuk endpoint `density`, `eta`, `gps/current`, dan `gps/stream`

4. `app/monitoring/page.tsx`
   - Render `MonitoringShell` untuk operasi lapangan
   - Fokus pada status GPS live, stasiun, dan tracking halte

## Aliran data dan API

- `components/use-gps-stream.ts` menggunakan `EventSource` untuk membuka SSE ke `/api/gps/stream`
- `/api/gps/stream` mengirim event `gps` setiap 3 detik dan heartbeat setiap 15 detik
- `lib/predict.ts` mengandung logika bisnis: estimasi trafik, kapasitas feeder, dan keamanan transfer
- `lib/mock-data.ts` menyediakan model mock untuk kendaraan, rute, stasiun, dan kepadatan
- `lib/data-source.ts` menggabungkan filter, data mock, dan prediksi menjadi `DashboardState`

## Kategori komponen

- UI halaman: `dashboard-shell.tsx`, `corridor-detail-shell.tsx`, `developer-shell.tsx`, `monitoring-shell.tsx`, `halte-detail-shell.tsx`
- Panel dan kartu: `eta-panel.tsx`, `feeder-panel.tsx`, `metric-card.tsx`, `hourly-bars.tsx`, `station-timeline.tsx`
- Peta: `realtime-map-client.tsx`, `map-panel.tsx`
- Developer/API: `api-reference.tsx`, `accordion-card.tsx`, `copy-button.tsx`
- Utility / state: `filters-bar.tsx`, `use-gps-stream.ts`

## Catatan

- Struktur folder `app/api` meniru arsitektur service internal dan memudahkan migrasi ke backend nyata.
- `lib/` berfungsi sebagai lapisan domain, sehingga logika prediksi dapat dengan mudah digantikan dengan model aktual atau data historis.
- `components/` dirancang agar setiap widget dapat digunakan ulang di berbagai halaman.

Jika Anda ingin menambahkan fitur baru, mulai dari `app/api` untuk route data, lalu gunakan `lib/` untuk logika domain, dan terakhir bangun halaman atau komponen di `components/`.
