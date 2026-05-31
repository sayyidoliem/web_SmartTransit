# SmartTransit Jakarta Dashboard

Dashboard prototype berbasis **Next.js App Router** untuk:

- **A. Predict jumlah feeder/bus berdasarkan density hourly** dari object detection (normal + lansia)
- **B. Predict ETA berdasarkan traffic**
- Monitoring **intermodal transfer window**
- Menampilkan UI yang mengikuti wireframe dashboard operasional

## Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript
- CSS custom tanpa library tambahan

## Menjalankan Project

```bash
npm install
npm run dev
```

Buka:

```bash
http://localhost:3000
```

## API Mock

- `GET /api/dashboard`
- `GET /api/density/current`
- `GET /api/density/hourly`
- `GET /api/eta?routeId=feeder-1a`
- `POST /api/intermodal/evaluate`

## Logika yang Dipakai

### A. Predict jumlah feeder/bus

```ts
weightedPassengers = normalCount + elderlyCount * elderlyWeight
baseBus = ceil(weightedPassengers / averageCapacityPerBus)
recommendedBus = baseBus + reserveBus
```

### B. Predict ETA berdasarkan traffic

```ts
normalMinutes = (distanceKm / baseSpeedKmh) * 60
adjustedMinutes = normalMinutes * trafficMultiplier
```

## Integrasi Backend Nyata

Kalau nanti kamu sudah punya backend Python/FastAPI atau service YOLO/ETA:

1. Ganti source di `lib/mock-data.ts`
2. Sambungkan route handler ke service nyata
3. Tambahkan WebSocket / SSE untuk update real-time

## Struktur Folder

```bash
smarttransit-dashboard/
├─ app/
│  ├─ api/
│  │  ├─ dashboard/route.ts
│  │  ├─ density/current/route.ts
│  │  ├─ density/hourly/route.ts
│  │  ├─ eta/route.ts
│  │  └─ intermodal/evaluate/route.ts
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
├─ components/
├─ lib/
└─ ...
```
