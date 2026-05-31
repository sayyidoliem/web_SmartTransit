import {
  evaluateTransferWindow,
  getCrowdingLabel,
  predictEtaByTraffic,
  predictFeederCount,
} from "./predict";
import type {
  ArrivalEstimate,
  CorridorUnit,
  DashboardFilters,
  DashboardState,
  GpsSnapshot,
  HourlyDensity,
  RouteShape,
  StationMarker,
  VehicleMarker,
  CrowdingFilter,
  PriorityFilter,
} from "./types";
const JAKARTA_TZ = "Asia/Jakarta";
const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const HOURS = [
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];
export const TODAY_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: JAKARTA_TZ,
}).format(new Date());
export const MIN_DATE = "2026-01-01";
export const MAX_FUTURE_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: JAKARTA_TZ,
}).format(new Date(Date.now() + 7 * 24 * 3600 * 1000));
export const CORRIDORS = [
  { value: "feeder-1a", label: "Feeder 1A — Dukuh Atas" },
  { value: "feeder-2b", label: "Feeder 2B — Sudirman" },
  { value: "feeder-3c", label: "Feeder 3C — Kuningan" },
] as const;
const baseHourly: HourlyDensity[] = [
  { hour: "06:00", normalCount: 36, elderlyCount: 5 },
  { hour: "07:00", normalCount: 50, elderlyCount: 8 },
  { hour: "08:00", normalCount: 48, elderlyCount: 7 },
  { hour: "09:00", normalCount: 26, elderlyCount: 3 },
  { hour: "10:00", normalCount: 22, elderlyCount: 2 },
  { hour: "11:00", normalCount: 28, elderlyCount: 4 },
  { hour: "12:00", normalCount: 30, elderlyCount: 4 },
  { hour: "13:00", normalCount: 27, elderlyCount: 4 },
  { hour: "14:00", normalCount: 25, elderlyCount: 3 },
  { hour: "15:00", normalCount: 34, elderlyCount: 5 },
  { hour: "16:00", normalCount: 42, elderlyCount: 6 },
  { hour: "17:00", normalCount: 56, elderlyCount: 10 },
  { hour: "18:00", normalCount: 46, elderlyCount: 8 },
];
const catalog: Record<
  string,
  {
    routeName: string;
    distanceKm: number;
    stations: StationMarker[];
    routes: RouteShape[];
    vehicles: VehicleMarker[];
  }
> = {
  "feeder-1a": {
    routeName: "Hub Dukuh Atas → Feeder 1A → MRT",
    distanceKm: 8.2,
    stations: [
      {
        id: "terminal-a",
        name: "Terminal A",
        type: "hub",
        etaText: "now",
        active: true,
        lat: -6.2141,
        lng: 106.8148,
      },
      {
        id: "halte-b",
        name: "Halte B",
        type: "stop",
        etaText: "7 min",
        active: true,
        lat: -6.2102,
        lng: 106.8212,
      },
      {
        id: "hub-c",
        name: "Hub C",
        type: "hub",
        etaText: "14 min",
        active: false,
        lat: -6.2048,
        lng: 106.8272,
      },
      {
        id: "mrt-dukuh",
        name: "MRT Dukuh Atas",
        type: "station",
        etaText: "20 min",
        active: false,
        lat: -6.2009,
        lng: 106.8227,
      },
    ],
    routes: [
      {
        id: "feeder-main",
        kind: "main",
        points: [
          { lat: -6.2141, lng: 106.8148 },
          { lat: -6.2128, lng: 106.8171 },
          { lat: -6.2102, lng: 106.8212 },
          { lat: -6.208, lng: 106.8244 },
          { lat: -6.2048, lng: 106.8272 },
        ],
      },
      {
        id: "connector",
        kind: "connector",
        points: [
          { lat: -6.2048, lng: 106.8272 },
          { lat: -6.203, lng: 106.825 },
          { lat: -6.2009, lng: 106.8227 },
        ],
      },
    ],
    vehicles: [
      {
        id: "f1-1",
        label: "Feeder 1A-01",
        routeId: "feeder-1a",
        nextEta: "4 min",
        crowding: "Normal",
        priorityAssigned: false,
        lat: -6.2136,
        lng: 106.8159,
        heading: 40,
      },
      {
        id: "f1-2",
        label: "Feeder 1A-02",
        routeId: "feeder-1a",
        nextEta: "6 min",
        crowding: "Ramai",
        priorityAssigned: false,
        lat: -6.2116,
        lng: 106.8192,
        heading: 40,
      },
      {
        id: "f1-3",
        label: "Feeder 1A-03",
        routeId: "feeder-1a",
        nextEta: "8 min",
        crowding: "Padat",
        priorityAssigned: true,
        lat: -6.2092,
        lng: 106.823,
        heading: 40,
      },
      {
        id: "f1-4",
        label: "Feeder 1A-04",
        routeId: "feeder-1a",
        nextEta: "10 min",
        crowding: "Padat",
        priorityAssigned: false,
        lat: -6.2066,
        lng: 106.8258,
        heading: 35,
      },
      {
        id: "f1-5",
        label: "Feeder 1A-05",
        routeId: "feeder-1a",
        nextEta: "12 min",
        crowding: "Overload",
        priorityAssigned: true,
        lat: -6.2036,
        lng: 106.8262,
        heading: 330,
      },
    ],
  },
  "feeder-2b": {
    routeName: "Blok M → Feeder 2B → MRT ASEAN",
    distanceKm: 5.8,
    stations: [
      {
        id: "blokm",
        name: "Blok M Hub",
        type: "hub",
        etaText: "now",
        active: true,
        lat: -6.2444,
        lng: 106.7987,
      },
      {
        id: "sisinga",
        name: "Sisingamangaraja",
        type: "stop",
        etaText: "6 min",
        active: true,
        lat: -6.2369,
        lng: 106.8005,
      },
      {
        id: "asean-stop",
        name: "ASEAN Connector",
        type: "hub",
        etaText: "12 min",
        active: false,
        lat: -6.2383,
        lng: 106.7996,
      },
      {
        id: "mrt-asean",
        name: "MRT ASEAN",
        type: "station",
        etaText: "16 min",
        active: false,
        lat: -6.2387,
        lng: 106.7994,
      },
    ],
    routes: [
      {
        id: "feeder-main",
        kind: "main",
        points: [
          { lat: -6.2444, lng: 106.7987 },
          { lat: -6.2415, lng: 106.7992 },
          { lat: -6.2383, lng: 106.7996 },
        ],
      },
      {
        id: "connector",
        kind: "connector",
        points: [
          { lat: -6.2383, lng: 106.7996 },
          { lat: -6.2387, lng: 106.7994 },
        ],
      },
    ],
    vehicles: [
      {
        id: "f2-1",
        label: "Feeder 2B-01",
        routeId: "feeder-2b",
        nextEta: "3 min",
        crowding: "Normal",
        priorityAssigned: false,
        lat: -6.2438,
        lng: 106.7989,
        heading: 22,
      },
      {
        id: "f2-2",
        label: "Feeder 2B-02",
        routeId: "feeder-2b",
        nextEta: "5 min",
        crowding: "Ramai",
        priorityAssigned: false,
        lat: -6.2417,
        lng: 106.7991,
        heading: 20,
      },
      {
        id: "f2-3",
        label: "Feeder 2B-03",
        routeId: "feeder-2b",
        nextEta: "8 min",
        crowding: "Padat",
        priorityAssigned: true,
        lat: -6.2397,
        lng: 106.7994,
        heading: 20,
      },
      {
        id: "f2-4",
        label: "Feeder 2B-04",
        routeId: "feeder-2b",
        nextEta: "11 min",
        crowding: "Overload",
        priorityAssigned: true,
        lat: -6.2389,
        lng: 106.7995,
        heading: 15,
      },
    ],
  },
  "feeder-3c": {
    routeName: "Kuningan City → Feeder 3C → LRT Rasuna",
    distanceKm: 6.8,
    stations: [
      {
        id: "kuningan",
        name: "Kuningan City",
        type: "hub",
        etaText: "now",
        active: true,
        lat: -6.2274,
        lng: 106.8291,
      },
      {
        id: "csw-link",
        name: "Rasuna Link",
        type: "stop",
        etaText: "5 min",
        active: true,
        lat: -6.2237,
        lng: 106.8276,
      },
      {
        id: "epiwalk",
        name: "Epicentrum",
        type: "hub",
        etaText: "10 min",
        active: false,
        lat: -6.221,
        lng: 106.831,
      },
      {
        id: "lrt-rasuna",
        name: "LRT Rasuna Said",
        type: "station",
        etaText: "15 min",
        active: false,
        lat: -6.2196,
        lng: 106.8328,
      },
    ],
    routes: [
      {
        id: "feeder-main",
        kind: "main",
        points: [
          { lat: -6.2274, lng: 106.8291 },
          { lat: -6.2255, lng: 106.8283 },
          { lat: -6.2237, lng: 106.8276 },
          { lat: -6.221, lng: 106.831 },
        ],
      },
      {
        id: "connector",
        kind: "connector",
        points: [
          { lat: -6.221, lng: 106.831 },
          { lat: -6.2196, lng: 106.8328 },
        ],
      },
    ],
    vehicles: [
      {
        id: "f3-1",
        label: "Feeder 3C-01",
        routeId: "feeder-3c",
        nextEta: "4 min",
        crowding: "Normal",
        priorityAssigned: false,
        lat: -6.2268,
        lng: 106.8289,
        heading: 60,
      },
      {
        id: "f3-2",
        label: "Feeder 3C-02",
        routeId: "feeder-3c",
        nextEta: "6 min",
        crowding: "Ramai",
        priorityAssigned: false,
        lat: -6.2249,
        lng: 106.828,
        heading: 55,
      },
      {
        id: "f3-3",
        label: "Feeder 3C-03",
        routeId: "feeder-3c",
        nextEta: "9 min",
        crowding: "Padat",
        priorityAssigned: true,
        lat: -6.2223,
        lng: 106.8295,
        heading: 45,
      },
      {
        id: "f3-4",
        label: "Feeder 3C-04",
        routeId: "feeder-3c",
        nextEta: "12 min",
        crowding: "Padat",
        priorityAssigned: false,
        lat: -6.2201,
        lng: 106.8321,
        heading: 38,
      },
    ],
  },
};

const humanizeCrowdingFilter = (v: CrowdingFilter) =>
  (
    ({
      all: "Semua crowding",
      normal: "Normal saja",
      ramai: "Ramai saja",
      padat: "Padat saja",
      overload: "Overload saja",
    }) as const
  )[v];
const humanizePriorityFilter = (v: PriorityFilter) =>
  (
    ({
      all: "Semua priority",
      "priority-only": "Priority only",
      "non-priority": "Non-priority",
    }) as const
  )[v];
const getCatalog = (id: string) => catalog[id] ?? catalog["feeder-1a"];
const isFuture = (date: string) => date > TODAY_DATE;
export function formatGeneratedAtLabel(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: JAKARTA_TZ,
  }).format(new Date(iso));
}

function dayMultiplier(day: string, date: string) {
  const weekday: Record<string, { normal: number; elderly: number }> = {
    Senin: { normal: 1, elderly: 1 },
    Selasa: { normal: 0.96, elderly: 1 },
    Rabu: { normal: 1.02, elderly: 1.02 },
    Kamis: { normal: 1.04, elderly: 1 },
    Jumat: { normal: 1.08, elderly: 1.06 },
    Sabtu: { normal: 0.82, elderly: 0.92 },
    Minggu: { normal: 0.72, elderly: 0.88 },
  };
  const dayIndex = Number((date || TODAY_DATE).split("-")[2]);
  const base = weekday[day] ?? weekday.Senin;
  return {
    normal: Math.max(0.7, base.normal + ((dayIndex % 5) - 2) * 0.01),
    elderly: Math.max(0.8, base.elderly + ((dayIndex % 4) - 1) * 0.01),
  };
}
function generateHourly(day: string, date: string, corridorId: string) {
  const ratio = dayMultiplier(day, date);
  const corridorBoost =
    corridorId === "feeder-2b" ? 0.94 : corridorId === "feeder-3c" ? 1.06 : 1;
  return baseHourly.map((row) => ({
    hour: row.hour,
    normalCount: Math.round(row.normalCount * ratio.normal * corridorBoost),
    elderlyCount: Math.max(
      1,
      Math.round(
        row.elderlyCount * ratio.elderly * (corridorBoost > 1 ? 1.02 : 1),
      ),
    ),
  }));
}
function trafficState(day: string, hour: string) {
  const idx = HOURS.indexOf(hour);
  if (idx >= 10)
    return day === "Sabtu" || day === "Minggu" ? "sedang" : "padat";
  if (idx <= 2) return day === "Minggu" ? "sedang" : "padat";
  if (day === "Jumat" && idx >= 8) return "padat";
  return "sedang";
}
function crowdingByHour(
  hour: string,
  priorityAssigned: boolean,
  index: number,
) {
  const rushMap: Record<string, number> = {
    "06:00": 0.58,
    "07:00": 0.82,
    "08:00": 0.78,
    "09:00": 0.42,
    "10:00": 0.36,
    "11:00": 0.44,
    "12:00": 0.48,
    "13:00": 0.46,
    "14:00": 0.43,
    "15:00": 0.58,
    "16:00": 0.7,
    "17:00": 0.96,
    "18:00": 0.84,
  };
  return getCrowdingLabel(
    (rushMap[hour] ?? 0.55) + index * 0.05 + (priorityAssigned ? 0.04 : 0),
  );
}
function calculatePropagatedDelay(
  date: string,
  corridorId: string,
  count: number,
) {
  const d = Number((date || TODAY_DATE).split("-")[2]);
  const incident = d % 3 === 0 ? 10 : d % 3 === 1 ? 0 : 5;
  const corridorExtra =
    corridorId === "feeder-3c" ? 4 : corridorId === "feeder-2b" ? 2 : 0;
  const futureExtra = isFuture(date) ? 2 : 0;
  const total = incident + corridorExtra + futureExtra;
  return Array.from({ length: count }, () => total);
}
function buildVehicles(
  corridorId: string,
  day: string,
  hour: string,
  date: string,
  now = Date.now(),
) {
  const cfg = getCatalog(corridorId);
  const d = Number((date || TODAY_DATE).split("-")[2]);
  const dayFactor = DAYS.indexOf(day) * 0.00012 + d * 0.000008;
  const hourFactor = HOURS.indexOf(hour) * 0.00009;
  const tick = Math.floor(now / 3000);
  return cfg.vehicles.map((v, index) => {
    const latOffset = Math.sin(tick / 5 + index) * 0.00025;
    const lngOffset = Math.cos(tick / 6 + index * 0.4) * 0.00025;
    return {
      ...v,
      lat: v.lat + dayFactor - hourFactor / 3 + latOffset,
      lng: v.lng + dayFactor / 2 + hourFactor + lngOffset,
      heading: (v.heading + tick * 6 + index * 5) % 360,
      crowding: crowdingByHour(hour, v.priorityAssigned, index),
      nextEta: `${4 + index * 2 + Math.max(0, HOURS.indexOf(hour) - 6)} min`,
    };
  });
}
function filterVehicles(
  vehicles: VehicleMarker[],
  crowding: CrowdingFilter,
  priority: PriorityFilter,
) {
  return vehicles.filter((v) => {
    const crowdingMatch =
      crowding === "all"
        ? true
        : crowding === "normal"
          ? v.crowding === "Normal"
          : crowding === "ramai"
            ? v.crowding === "Ramai"
            : crowding === "padat"
              ? v.crowding === "Padat"
              : v.crowding === "Overload";
    const priorityMatch =
      priority === "all"
        ? true
        : priority === "priority-only"
          ? v.priorityAssigned
          : !v.priorityAssigned;
    return crowdingMatch && priorityMatch;
  });
}
function defaultFilters(): DashboardFilters {
  return {
    corridorId: "feeder-1a",
    date: TODAY_DATE,
    day: deriveDayFromDate(TODAY_DATE),
    hour: "17:00",
    crowding: "all",
    priority: "all",
    crowdingLabel: "Semua crowding",
    priorityLabel: "Semua priority",
  };
}
export function getHourlyDensityForDay(
  day?: string,
  date?: string,
  corridorId = "feeder-1a",
) {
  const resolvedDate = date ?? TODAY_DATE;
  const resolvedDay = day ?? deriveDayFromDate(resolvedDate);
  return generateHourly(resolvedDay, resolvedDate, corridorId);
}
export function getCurrentDensity(
  {
    corridorId = "feeder-1a",
    date = TODAY_DATE,
    day,
    hour = "17:00",
  }: { corridorId?: string; date?: string; day?: string; hour?: string },
  snapshotAt?: string,
) {
  const resolvedDay = day ?? deriveDayFromDate(date);
  const data = generateHourly(resolvedDay, date, corridorId);
  const row = data.find((i) => i.hour === hour) ?? data[0];
  return {
    corridorId,
    date,
    day: resolvedDay,
    hour,
    normalCount: row.normalCount,
    elderlyCount: row.elderlyCount,
    standingElderly: row.elderlyCount >= 8 ? 3 : 1,
    timestamp: snapshotAt ?? new Date().toISOString(),
  };
}
export function getEtaStateForRoute(
  routeId: string,
  selection: { date?: string; day?: string; hour?: string } = {},
) {
  const date = selection.date ?? TODAY_DATE;
  const day = selection.day ?? deriveDayFromDate(date);
  const hour = selection.hour ?? "17:00";
  const cfg = getCatalog(routeId);
  const t = trafficState(day, hour);
  const bus = predictEtaByTraffic({
    distanceKm: cfg.distanceKm,
    baseSpeedKmh:
      routeId === "feeder-3c" ? 24 : routeId === "feeder-2b" ? 26 : 28,
    trafficState: t,
  });
  const train = predictEtaByTraffic({
    distanceKm: routeId === "feeder-3c" ? 3.8 : 4.6,
    baseSpeedKmh: 40,
    trafficState: t === "padat" ? "sedang" : t,
  });
  const transfer = evaluateTransferWindow({
    feederEtaMinutes: bus.adjustedMinutes,
    trainDepartureInMinutes: train.adjustedMinutes + 8,
    transferBufferMinutes: 10,
  });
  return { routeId, date, day, hour, bus, train, transfer };
}
export function getRealtimeGpsSnapshot(
  input: Partial<DashboardFilters> = {},
  options?: { generatedAt?: string },
): GpsSnapshot {
  const merged = { ...defaultFilters(), ...input } as DashboardFilters;
  merged.day = merged.day || deriveDayFromDate(merged.date);
  const generatedAt = options?.generatedAt ?? new Date().toISOString();
  const all = buildVehicles(
    merged.corridorId,
    merged.day,
    merged.hour,
    merged.date,
    new Date(generatedAt).getTime(),
  );
  return {
    generatedAt,
    generatedAtLabel: formatGeneratedAtLabel(generatedAt),
    vehicles: filterVehicles(all, merged.crowding, merged.priority),
  };
}
export function getCorridorUnits(
  corridorId: string,
  filters: DashboardFilters,
): CorridorUnit[] {
  const vehicles = filterVehicles(
    buildVehicles(corridorId, filters.day, filters.hour, filters.date),
    filters.crowding,
    filters.priority,
  );
  const delays = calculatePropagatedDelay(
    filters.date,
    corridorId,
    vehicles.length,
  );
  return vehicles.map((v, index) => ({
    id: v.id,
    label: v.label,
    crowding: v.crowding,
    priorityAssigned: v.priorityAssigned,
    baseEtaMinutes:
      4 +
      index * 2 +
      Math.max(0, HOURS.indexOf(filters.hour) - 5) +
      delays[index],
    propagatedDelayMinutes: delays[index],
    progressBoost: index,
  }));
}
export function estimateArrivalMinutes(
  vehicle: VehicleMarker,
  station: StationMarker,
  propagatedDelayMinutes: number,
) {
  const latKm = (vehicle.lat - station.lat) * 111;
  const lngKm =
    (vehicle.lng - station.lng) * 111 * Math.cos((vehicle.lat * Math.PI) / 180);
  const directKm = Math.sqrt(latKm * latKm + lngKm * lngKm);
  return Math.max(1, Math.round((directKm / 22) * 60) + propagatedDelayMinutes);
}
export function getStopArrivals(
  halteId: string,
  filters: DashboardFilters,
): ArrivalEstimate[] {
  const cfg = getCatalog(filters.corridorId);
  const stop = cfg.stations.find((s) => s.id === halteId) ?? cfg.stations[0];
  return getCorridorUnits(filters.corridorId, filters)
    .map((u) => ({
      stationId: stop.id,
      stationName: stop.name,
      etaMinutes: Math.max(
        1,
        u.baseEtaMinutes +
          cfg.stations.findIndex((s) => s.id === stop.id) * 2 -
          u.progressBoost,
      ),
      unitId: u.id,
      unitLabel: u.label,
    }))
    .sort((a, b) => a.etaMinutes - b.etaMinutes);
}
export function createInitialDashboardState(
  input: Partial<DashboardFilters> = {},
): DashboardState {
  return buildDashboardState(input, { generatedAt: new Date().toISOString() });
}
export function buildDashboardState(
  input: Partial<DashboardFilters> = {},
  options?: { generatedAt?: string },
): DashboardState {
  const merged = { ...defaultFilters(), ...input } as DashboardFilters;
  merged.date = merged.date || TODAY_DATE;
  merged.day = merged.day || deriveDayFromDate(merged.date);
  merged.corridorId = merged.corridorId || "feeder-1a";
  merged.crowdingLabel = humanizeCrowdingFilter(merged.crowding);
  merged.priorityLabel = humanizePriorityFilter(merged.priority);
  const generatedAt = options?.generatedAt ?? new Date().toISOString();
  const cfg = getCatalog(merged.corridorId);
  const hourly = generateHourly(merged.day, merged.date, merged.corridorId);
  const densityRow = hourly.find((i) => i.hour === merged.hour) ?? hourly[0];
  const feederPrediction = predictFeederCount({
    hourly,
    selectedHour: merged.hour,
    averageCapacityPerBus: 40,
    elderlyWeight: 1.35,
    reserveFactor: 0.2,
  });
  const eta = getEtaStateForRoute(merged.corridorId, {
    date: merged.date,
    day: merged.day,
    hour: merged.hour,
  });
  const currentPassengers = densityRow.normalCount + densityRow.elderlyCount;
  const busCapacity = Math.max(40, feederPrediction.recommendedBus * 40);
  const stations = cfg.stations.map((s, index) => ({
    ...s,
    etaText:
      index === 0
        ? "now"
        : `${index * 5 + Math.max(0, eta.bus.adjustedMinutes - 10)} min`,
    active: index <= 1,
  }));
  const gpsSnapshot = getRealtimeGpsSnapshot(merged, { generatedAt });
  const corridorUnits = getCorridorUnits(merged.corridorId, merged);
  const propagatedDelay = corridorUnits[0]?.propagatedDelayMinutes ?? 0;
  const estimateMode = isFuture(merged.date);
  return {
    generatedAt,
    generatedAtLabel: formatGeneratedAtLabel(generatedAt),
    routeName: cfg.routeName,
    currentTimeLabel: `${merged.hour} slot monitoring`,
    estimateMode,
    estimateNote: estimateMode
      ? `Tanggal ${merged.date} adalah tanggal mendatang, sehingga ETA dan dispatch bersifat estimasi. Jika unit sebelumnya terlambat, unit berikutnya ikut membawa propagated delay ${propagatedDelay} menit.`
      : propagatedDelay > 0
        ? `Bus sebelumnya mengalami keterlambatan ${propagatedDelay} menit, sehingga unit berikutnya ikut terdampak.`
        : "Tidak ada propagated delay material pada snapshot ini.",
    filters: merged,
    filterOptions: {
      minDate: MIN_DATE,
      maxDate: MAX_FUTURE_DATE,
      corridors: CORRIDORS.map((i) => ({ ...i })),
      days: DAYS,
      hours: HOURS,
      crowding: [
        { value: "all", label: "Semua" },
        { value: "normal", label: "Normal" },
        { value: "ramai", label: "Ramai" },
        { value: "padat", label: "Padat" },
        { value: "overload", label: "Overload" },
      ],
      priority: [
        { value: "all", label: "Semua" },
        { value: "priority-only", label: "Priority only" },
        { value: "non-priority", label: "Non-priority" },
      ],
    },
    vehicles: {
      totalActiveFeeder: cfg.vehicles.length,
      recommendedFeeder: feederPrediction.recommendedBus,
      priorityBus: feederPrediction.priorityBus,
    },
    density: {
      currentPassengers,
      normalCount: densityRow.normalCount,
      elderlyCount: densityRow.elderlyCount,
      standingElderly: densityRow.elderlyCount >= 8 ? 3 : 1,
      crowdingLabel: getCrowdingLabel(currentPassengers / busCapacity),
      hourly,
    },
    dispatch: {
      explanation: estimateMode
        ? `Forecast mode aktif untuk ${merged.date}; rekomendasi feeder dihitung dari pola histori, jam, dan propagated delay.`
        : `Prediksi AI menghasilkan ${feederPrediction.recommendedBus} feeder dengan weighted passenger ${Math.round(feederPrediction.weightedPassengers)}.`,
      priorityMessage:
        feederPrediction.priorityBus > 0
          ? "Tambahkan 1 kendaraan prioritas untuk lansia dan awasi kursi prioritas di feeder terpadat."
          : "Belum perlu kendaraan prioritas tambahan, tetap monitor standing elderly secara live.",
    },
    eta,
    stations,
    map: { stations, routes: cfg.routes },
    gpsSnapshot,
    corridorUnits,
    alerts: [
      {
        title: estimateMode ? "Future estimate mode" : "Operational live mode",
        description: estimateMode
          ? "Tanggal mendatang memakai mode estimasi operasional."
          : "Snapshot diperlakukan sebagai operasi aktual/mock hari ini.",
        levelColor: estimateMode ? "#f4c65a" : "#38c7ff",
      },
      {
        title:
          propagatedDelay > 0
            ? "Cascading delay aktif"
            : "Tidak ada cascading delay besar",
        description:
          propagatedDelay > 0
            ? `Bus A terlambat ${propagatedDelay} menit, sehingga Bus B dan unit berikutnya ikut memiliki estimasi delay ${propagatedDelay} menit.`
            : "Belum ada dampak keterlambatan yang diturunkan ke unit selanjutnya.",
        levelColor: propagatedDelay > 0 ? "#ff7a7a" : "#83da83",
      },
      {
        title: eta.transfer.safe
          ? "Koneksi feeder aman"
          : "Risiko koneksi gagal",
        description: eta.transfer.recommendation,
        levelColor: eta.transfer.safe ? "#83da83" : "#ff7a7a",
      },
    ],
    apiExamples: {
      densityCurrent: getCurrentDensity(
        {
          corridorId: merged.corridorId,
          date: merged.date,
          day: merged.day,
          hour: merged.hour,
        },
        generatedAt,
      ),
      eta,
      gpsCurrent: gpsSnapshot,
      gpsStreamExample: {
        subscribe: `/api/gps/stream?corridorId=${merged.corridorId}&date=${merged.date}&day=${merged.day}&hour=${merged.hour}&crowding=${merged.crowding}&priority=${merged.priority}`,
        event: "gps",
        samplePayload: gpsSnapshot,
      },
    },
  };
}
function deriveDayFromDate(date: string): string {
  const dayIndex = new Date(`${date}T00:00:00+07:00`).getDay();

  return DAYS[dayIndex] ?? "Senin";
}