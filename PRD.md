**Product Requirement Document (PRD) — SmartTransit Web**

Versi: 1.0
Tanggal: 2026-05-31

**Ringkasan**
- Produk: SmartTransit — aplikasi web dashboard pemantauan dan analitik transportasi massal.
- Tujuan: Sediakan visibilitas realtime terhadap posisi kendaraan, ETA, kepadatan, dan metrik koridor untuk operator dan perencana.
- Source: Frontend & API berada di folder [app](app) dan komponen UI di [components](components).

**Tujuan & Keberhasilan**
- Tujuan Utama: Memungkinkan operator/perencana memantau armada dan mengambil keputusan operasional cepat.
- Ukuran Keberhasilan:
  - Latensi data realtime pada peta < 3 detik.
  - Akurasi ETA: MAE ≤ 30 detik untuk 80% perjalanan uji.
  - Dashboard tersedia ≥ 95% selama jam operasi.

**Target Pengguna**
- Operator armada
- Perencana transportasi
- Tim developer / admin sistem

**Ruang Lingkup MVP**
- Dashboard realtime: peta interaktif, unit timeline, metric cards — komponen utama di [components/realtime-map-client.tsx](components/realtime-map-client.tsx) dan [components/dashboard-shell.tsx](components/dashboard-shell.tsx).
- ETA & prediksi: API di [app/api/eta/route.ts](app/api/eta/route.ts) dan logika di [lib/predict.ts](lib/predict.ts).
- GPS stream ingestion: route di [app/api/gps/stream/route.ts](app/api/gps/stream/route.ts) dan hook `use-gps-stream` di [components/use-gps-stream.ts](components/use-gps-stream.ts).
- Kepadatan (density): endpoints di [app/api/density](app/api/density).
- Halaman koridor: [app/corridor/[id]/page.tsx](app/corridor/[id]/page.tsx).
- Developer view & monitoring: [app/developer/page.tsx](app/developer/page.tsx) dan [components/monitoring-shell.tsx](components/monitoring-shell.tsx).

**Fitur Utama & Acceptance Criteria**
- Peta Realtime
  - Deskripsi: visualisasi posisi kendaraan, cluster, dan status.
  - AC: kendaraan muncul atau bergerak di peta dalam <3s setelah update; klik unit membuka timeline.
- Unit Timeline & ETA
  - Deskripsi: timeline event per kendaraan dan ETA ke halte berikutnya.
  - AC: ETA tampil per halte; MAE ≤ 30s terhadap dataset uji.
- Kepadatan Koridor (Hourly & Current)
  - Deskripsi: grafik kepadatan per jam dan snapshot current density.
  - AC: data hourly tersedia untuk 7 hari terakhir; snapshot refresh tiap 1 menit.
- Alerts / Monitoring
  - Deskripsi: deteksi anomali (delay besar, off-route, out-of-service) dan notifikasi internal.
  - AC: alert ter-trigger bila metric melewati threshold dan tercatat di monitoring view.
- API Documentation
  - Deskripsi: dokumentasi request/response untuk setiap route internal.
  - AC: setiap route punya schema contoh dan penjelasan input/output.

**Arsitektur & Integrasi Data**
- Data Sources: GPS stream (realtime), historical trip logs, sensor occupancy (opsional).
- Layer: Next.js API routes di [app/api](app/api) untuk ingestion dan aggregation; frontend konsumsi via SSE/WebSocket atau polling.
- Model Prediksi: modul di [lib/predict.ts](lib/predict.ts) sebagai service internal (stateless function untuk MVP).
- Storage: time-series DB (opsional) untuk historical density / benchmarking.

**Non-functional Requirements**
- Performa: peta realtime <3s end-to-end; cold page load <2s.
- Skalabilitas: dapat menampung puncak stream besar (rencanakan buffering/queueing).
- Keamanan: TLS, autentikasi API (API key / OAuth), minimal privilege untuk endpoints.
- Aksesibilitas: ikuti WCAG AA untuk halaman utama.
- Observabilitas: metrics (latency, ETA error, error rate), logging, health checks.

**User Flows (singkat)**
- Flow Operator: buka dashboard → filter koridor → pantau peta → klik kendaraan → kirim alert.
- Flow Planner: buka corridor page → cek hourly density → export data untuk analisis.
- Flow Developer: buka developer page → lihat raw stream & replay untuk debugging.

**Milestones & Roadmap (MVP contoh)**
- Sprint 1 (2w): Infrastruktur data + GPS ingestion + peta realtime dasar.
- Sprint 2 (2w): ETA endpoint + unit timeline + corridor page.
- Sprint 3 (2w): Density hourly, monitoring, dokumentasi API.
- MVP Release (6w): semua AC di "Ruang Lingkup MVP" terpenuhi.

**Metrics & Analitik**
- KPI: latency feed, ETA MAE, dashboard uptime, event processing rate, jumlah alert.

**Risiko & Mitigasi**
- Kualitas feed GPS buruk → terapkan smoothing, filtering, dan fallback ke data historis.
- Lonjakan volume stream → gunakan queue (Kafka/Rabbit) dan autoscaling.
- Isu privasi → anonymize ID dan batasi retention.

**Asumsi & Pertanyaan Terbuka**
- Asumsi: tersedia akses ke feed GPS streaming dan dataset historis untuk validasi.
- Pertanyaan:
  1. Format dan otentikasi feed GPS eksternal apa yang tersedia?
  2. Perlu integrasi notifikasi eksternal (Slack/SMS/email)?
  3. Ada target SLA/SLO formal selain metrik di atas?

**Checklist Acceptance (MVP)**
- GPS stream diterima dan diproses.
- Peta realtime menampilkan kendaraan dan update <3s.
- Endpoint ETA mengembalikan estimasi dan diuji terhadap sample.
- Charts density hourly & current tersedia.
- Dokumentasi API internal tersedia.
