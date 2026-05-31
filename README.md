# SmartTransit Jakarta Dashboard — Realtime GPS + Real Map

Versi ini menambahkan:

- **Realtime GPS stream** berbasis Server-Sent Events (SSE)
- **Real map** menggunakan **Leaflet + React Leaflet + OpenStreetMap tiles**
- Dropdown filter operasional:
  - crowding status
  - priority
  - waktu (jam)
  - waktu (hari)
- SSR-safe hydration pattern untuk render awal yang stabil

## Jalankan

```bash
npm install
npm run dev
```

Buka:

```bash
http://localhost:3000
```

## Endpoint mock

- `GET /api/dashboard?day=Senin&hour=17:00&crowding=all&priority=all`
- `GET /api/gps/current?day=Senin&hour=17:00&crowding=all&priority=all`
- `GET /api/gps/stream?day=Senin&hour=17:00&crowding=all&priority=all`
- `GET /api/density/current?day=Senin&hour=17:00`
- `GET /api/density/hourly?day=Senin`
- `GET /api/eta?routeId=feeder-1a&day=Senin&hour=17:00`
- `POST /api/intermodal/evaluate`

## Catatan penting

- **Koordinat GPS dan stream pada project ini masih simulasi/mock** untuk demo end-to-end, bukan GPS armada produksi.
- Map memakai OpenStreetMap tile layer. Untuk penggunaan produksi berskala tinggi, pastikan patuh pada tile usage policy OSM atau gunakan tile provider sendiri.
