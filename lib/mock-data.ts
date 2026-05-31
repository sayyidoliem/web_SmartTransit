import { evaluateTransferWindow, getCrowdingLabel, predictEtaByTraffic, predictFeederCount } from "./predict";
import type {
  CrowdingFilter,
  DashboardFilters,
  DashboardState,
  GpsSnapshot,
  HourlyDensity,
  PriorityFilter,
  RouteShape,
  StationMarker,
  VehicleMarker
} from "./types";

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
const HOURS = ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const JAKARTA_TIMEZONE = "Asia/Jakarta";

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
  { hour: "18:00", normalCount: 46, elderlyCount: 8 }
];

const dayMultipliers: Record<string, { normal: number; elderly: number }> = {
  Senin: { normal: 1.0, elderly: 1.0 },
  Selasa: { normal: 0.96, elderly: 1.0 },
  Rabu: { normal: 1.02, elderly: 1.02 },
  Kamis: { normal: 1.04, elderly: 1.0 },
  Jumat: { normal: 1.08, elderly: 1.06 },
  Sabtu: { normal: 0.82, elderly: 0.92 },
  Minggu: { normal: 0.72, elderly: 0.88 }
};

const stations: StationMarker[] = [
  { id: "terminal-a", name: "Terminal A", type: "hub", etaText: "now", active: true, lat: -6.2141, lng: 106.8148 },
  { id: "halte-b", name: "Halte B", type: "stop", etaText: "7 min", active: true, lat: -6.2102, lng: 106.8212 },
  { id: "hub-c", name: "Hub C", type: "hub", etaText: "14 min", active: false, lat: -6.2048, lng: 106.8272 },
  { id: "mrt-dukuh", name: "MRT Dukuh Atas", type: "station", etaText: "20 min", active: false, lat: -6.2009, lng: 106.8227 }
];

const routeShapes: RouteShape[] = [
  {
    id: "feeder-main",
    kind: "main",
    points: [
      { lat: -6.2141, lng: 106.8148 },
      { lat: -6.2128, lng: 106.8171 },
      { lat: -6.2102, lng: 106.8212 },
      { lat: -6.2080, lng: 106.8244 },
      { lat: -6.2048, lng: 106.8272 }
    ]
  },
  {
    id: "intermodal-connector",
    kind: "connector",
    points: [
      { lat: -6.2048, lng: 106.8272 },
      { lat: -6.2030, lng: 106.8250 },
      { lat: -6.2009, lng: 106.8227 }
    ]
  }
];

const baseVehicles: VehicleMarker[] = [
  { id: "f-1", label: "Feeder 1A-01", routeId: "feeder-1a", nextEta: "4 min", crowding: "Normal", priorityAssigned: false, lat: -6.2136, lng: 106.8159, heading: 40 },
  { id: "f-2", label: "Feeder 1A-02", routeId: "feeder-1a", nextEta: "6 min", crowding: "Ramai", priorityAssigned: false, lat: -6.2116, lng: 106.8192, heading: 40 },
  { id: "f-3", label: "Feeder 1A-03", routeId: "feeder-1a", nextEta: "8 min", crowding: "Padat", priorityAssigned: true, lat: -6.2092, lng: 106.8230, heading: 40 },
  { id: "f-4", label: "Feeder 1A-04", routeId: "feeder-1a", nextEta: "10 min", crowding: "Padat", priorityAssigned: false, lat: -6.2066, lng: 106.8258, heading: 35 },
  { id: "f-5", label: "Feeder 1A-05", routeId: "feeder-1a", nextEta: "12 min", crowding: "Overload", priorityAssigned: true, lat: -6.2036, lng: 106.8262, heading: 330 }
];

export function formatGeneratedAtLabel(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: JAKARTA_TIMEZONE
  }).format(new Date(iso));
}

function generateHourlyByDay(day: string): HourlyDensity[] {
  const ratio = dayMultipliers[day] ?? dayMultipliers.Senin;
  return baseHourly.map((row) => ({
    hour: row.hour,
    normalCount: Math.round(row.normalCount * ratio.normal),
    elderlyCount: Math.max(1, Math.round(row.elderlyCount * ratio.elderly))
  }));
}

function vehicleCrowdingByHour(hour: string, priorityAssigned: boolean, index: number) {
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
    "18:00": 0.84
  };

  const ratio = rushMap[hour] ?? 0.55;
  const adjusted = ratio + index * 0.05 + (priorityAssigned ? 0.04 : 0);
  return getCrowdingLabel(adjusted);
}

function adjustVehiclePosition(vehicle: VehicleMarker, tick: number, index: number): VehicleMarker {
  const latOffset = Math.sin(tick / 5 + index) * 0.00035;
  const lngOffset = Math.cos(tick / 6 + index * 0.4) * 0.00042;
  return {
    ...vehicle,
    lat: vehicle.lat + latOffset,
    lng: vehicle.lng + lngOffset,
    heading: (vehicle.heading + tick * 6 + index * 5) % 360
  };
}

function buildVehicles(day: string, hour: string, now = Date.now()): VehicleMarker[] {
  const dayFactor = DAYS.indexOf(day) * 0.00018;
  const hourFactor = HOURS.indexOf(hour) * 0.00012;
  const tick = Math.floor(now / 3000);

  return baseVehicles.map((vehicle, index) => {
    const crowding = vehicleCrowdingByHour(hour, vehicle.priorityAssigned, index);
    const shifted = {
      ...vehicle,
      lat: vehicle.lat + dayFactor - hourFactor / 3,
      lng: vehicle.lng + dayFactor / 2 + hourFactor,
      crowding,
      nextEta: `${4 + index * 2 + Math.max(0, HOURS.indexOf(hour) - 6)} min`
    };
    return adjustVehiclePosition(shifted, tick, index);
  });
}

function humanizeCrowdingFilter(filter: CrowdingFilter) {
  return {
    all: "Semua crowding",
    normal: "Normal saja",
    ramai: "Ramai saja",
    padat: "Padat saja",
    overload: "Overload saja"
  }[filter];
}

function humanizePriorityFilter(filter: PriorityFilter) {
  return {
    all: "Semua priority",
    "priority-only": "Priority only",
    "non-priority": "Non-priority"
  }[filter];
}

function applyVehicleFilters(vehicles: VehicleMarker[], crowding: CrowdingFilter, priority: PriorityFilter) {
  return vehicles.filter((vehicle) => {
    const crowdingMatch = crowding === "all"
      ? true
      : crowding === "normal"
        ? vehicle.crowding === "Normal"
        : crowding === "ramai"
          ? vehicle.crowding === "Ramai"
          : crowding === "padat"
            ? vehicle.crowding === "Padat"
            : vehicle.crowding === "Overload";

    const priorityMatch = priority === "all"
      ? true
      : priority === "priority-only"
        ? vehicle.priorityAssigned
        : !vehicle.priorityAssigned;

    return crowdingMatch && priorityMatch;
  });
}

function trafficState(day: string, hour: string) {
  const hourIndex = HOURS.indexOf(hour);
  if (hourIndex >= 10) return day === "Sabtu" || day === "Minggu" ? "sedang" : "padat";
  if (hourIndex <= 2) return day === "Minggu" ? "sedang" : "padat";
  if (day === "Jumat" && hourIndex >= 8) return "padat";
  return "sedang";
}

export function getHourlyDensityForDay(day = "Senin") {
  return generateHourlyByDay(day);
}

export function getCurrentDensity({ day = "Senin", hour = "17:00" }: { day?: string; hour?: string }, snapshotAt?: string) {
  const data = generateHourlyByDay(day);
  const row = data.find((item) => item.hour === hour) ?? data[0];
  return {
    day,
    hour,
    normalCount: row.normalCount,
    elderlyCount: row.elderlyCount,
    standingElderly: row.elderlyCount >= 8 ? 3 : 1,
    timestamp: snapshotAt ?? new Date().toISOString()
  };
}

export function getEtaStateForRoute(routeId: string, selection: { day?: string; hour?: string } = {}) {
  const day = selection.day ?? "Senin";
  const hour = selection.hour ?? "17:00";
  const currentTraffic = trafficState(day, hour);

  const busEta = predictEtaByTraffic({
    distanceKm: routeId === "feeder-1a" ? 8.2 : 6.4,
    baseSpeedKmh: routeId === "feeder-1a" ? 28 : 30,
    trafficState: currentTraffic
  });

  const trainEta = predictEtaByTraffic({
    distanceKm: 4.6,
    baseSpeedKmh: 40,
    trafficState: currentTraffic === "padat" ? "sedang" : currentTraffic
  });

  const transfer = evaluateTransferWindow({
    feederEtaMinutes: busEta.adjustedMinutes,
    trainDepartureInMinutes: trainEta.adjustedMinutes + 8,
    transferBufferMinutes: 10
  });

  return {
    routeId,
    day,
    hour,
    bus: busEta,
    train: trainEta,
    transfer
  };
}

function defaultFilters(): DashboardFilters {
  return {
    crowding: "all",
    priority: "all",
    hour: "17:00",
    day: "Senin",
    crowdingLabel: humanizeCrowdingFilter("all"),
    priorityLabel: humanizePriorityFilter("all")
  };
}

export function getRealtimeGpsSnapshot(input: Partial<DashboardFilters> = {}, options?: { generatedAt?: string }) : GpsSnapshot {
  const merged = { ...defaultFilters(), ...input } as DashboardFilters;
  const generatedAt = options?.generatedAt ?? new Date().toISOString();
  const allVehicles = buildVehicles(merged.day, merged.hour, new Date(generatedAt).getTime());
  const filtered = applyVehicleFilters(allVehicles, merged.crowding, merged.priority);

  return {
    generatedAt,
    generatedAtLabel: formatGeneratedAtLabel(generatedAt),
    vehicles: filtered
  };
}

export function createInitialDashboardState(input: Partial<DashboardFilters> = {}): DashboardState {
  const generatedAt = new Date().toISOString();
  return buildDashboardState(input, { generatedAt });
}

export function buildDashboardState(input: Partial<DashboardFilters> = {}, options?: { generatedAt?: string }): DashboardState {
  const merged = { ...defaultFilters(), ...input } as DashboardFilters;
  merged.crowdingLabel = humanizeCrowdingFilter(merged.crowding);
  merged.priorityLabel = humanizePriorityFilter(merged.priority);

  const generatedAt = options?.generatedAt ?? new Date().toISOString();
  const generatedAtLabel = formatGeneratedAtLabel(generatedAt);

  const hourly = generateHourlyByDay(merged.day);
  const densityRow = hourly.find((item) => item.hour === merged.hour) ?? hourly[0];

  const feederPrediction = predictFeederCount({
    hourly,
    selectedHour: merged.hour,
    averageCapacityPerBus: 40,
    elderlyWeight: 1.35,
    reserveFactor: 0.2
  });

  const etaState = getEtaStateForRoute("feeder-1a", { day: merged.day, hour: merged.hour });
  const currentPassengers = densityRow.normalCount + densityRow.elderlyCount;
  const busCapacity = Math.max(40, feederPrediction.recommendedBus * 40);
  const crowdingLabel = getCrowdingLabel(currentPassengers / busCapacity);

  const dynamicStations = stations.map((station, index) => {
    const etaBase = index === 0 ? 0 : index * 5 + Math.max(0, etaState.bus.adjustedMinutes - 10);
    return {
      ...station,
      etaText: index === 0 ? "now" : `${etaBase} min`,
      active: index <= 1
    };
  });

  const gpsSnapshot = getRealtimeGpsSnapshot(merged, { generatedAt });

  return {
    generatedAt,
    generatedAtLabel,
    routeName: "Hub Dukuh Atas → Feeder 1A → MRT",
    currentTimeLabel: `${merged.hour} slot monitoring`,
    filters: merged,
    filterOptions: {
      days: DAYS,
      hours: HOURS,
      crowding: [
        { value: "all", label: "Semua" },
        { value: "normal", label: "Normal" },
        { value: "ramai", label: "Ramai" },
        { value: "padat", label: "Padat" },
        { value: "overload", label: "Overload" }
      ],
      priority: [
        { value: "all", label: "Semua" },
        { value: "priority-only", label: "Priority only" },
        { value: "non-priority", label: "Non-priority" }
      ]
    },
    vehicles: {
      totalActiveFeeder: baseVehicles.length,
      recommendedFeeder: feederPrediction.recommendedBus,
      priorityBus: feederPrediction.priorityBus
    },
    density: {
      currentPassengers,
      normalCount: densityRow.normalCount,
      elderlyCount: densityRow.elderlyCount,
      standingElderly: densityRow.elderlyCount >= 8 ? 3 : 1,
      crowdingLabel,
      hourly
    },
    dispatch: {
      explanation: `Prediksi AI menghasilkan ${feederPrediction.recommendedBus} feeder dengan weighted passenger ${Math.round(feederPrediction.weightedPassengers)}.`,
      priorityMessage: feederPrediction.priorityBus > 0
        ? "Tambahkan 1 kendaraan prioritas untuk lansia dan awasi kursi prioritas di feeder terpadat."
        : "Belum perlu kendaraan prioritas tambahan, tetap monitor standing elderly secara live."
    },
    eta: {
      bus: etaState.bus,
      train: etaState.train,
      transfer: etaState.transfer
    },
    stations: dynamicStations,
    map: {
      stations: dynamicStations,
      routes: routeShapes
    },
    gpsSnapshot,
    alerts: [
      {
        title: feederPrediction.priorityBus > 0 ? "Priority demand tinggi" : "Priority demand stabil",
        description: feederPrediction.priorityBus > 0
          ? "Jumlah lansia di atas threshold, sediakan feeder prioritas di jam terpilih."
          : "Belum ada lonjakan priority demand pada slot terpilih.",
        levelColor: feederPrediction.priorityBus > 0 ? "#b495ff" : "#35c7ff"
      },
      {
        title: etaState.transfer.safe ? "Koneksi feeder aman" : "Risiko koneksi gagal",
        description: etaState.transfer.recommendation,
        levelColor: etaState.transfer.safe ? "#83da83" : "#ff7676"
      },
      {
        title: gpsSnapshot.vehicles.length === 0 ? "Tidak ada armada sesuai filter" : `${gpsSnapshot.vehicles.length} armada terlihat di peta`,
        description: gpsSnapshot.vehicles.length === 0
          ? "Ubah filter crowding atau priority untuk menampilkan armada pada peta."
          : `Filter ${merged.crowdingLabel} dan ${merged.priorityLabel} berhasil diterapkan pada GPS stream.`,
        levelColor: gpsSnapshot.vehicles.length === 0 ? "#f4c65a" : "#35c7ff"
      }
    ],
    apiExamples: {
      densityCurrent: getCurrentDensity({ day: merged.day, hour: merged.hour }, generatedAt),
      eta: getEtaStateForRoute("feeder-1a", { day: merged.day, hour: merged.hour }),
      gpsCurrent: gpsSnapshot,
      gpsStreamExample: {
        subscribe: `/api/gps/stream?day=${merged.day}&hour=${merged.hour}&crowding=${merged.crowding}&priority=${merged.priority}`,
        event: "gps",
        samplePayload: gpsSnapshot
      }
    }
  };
}
