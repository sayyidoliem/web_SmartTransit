import type { CrowdingLabel, HourlyDensity, TrafficState } from "./types";

export function getCrowdingLabel(totalLoadRatio: number): CrowdingLabel {
  if (totalLoadRatio >= 0.95) return "Overload";
  if (totalLoadRatio >= 0.8) return "Padat";
  if (totalLoadRatio >= 0.55) return "Ramai";
  return "Normal";
}

export function predictFeederCount(params: {
  hourly: HourlyDensity[];
  selectedHour: string;
  averageCapacityPerBus?: number;
  elderlyWeight?: number;
  reserveFactor?: number;
}) {
  const {
    hourly,
    selectedHour,
    averageCapacityPerBus = 40,
    elderlyWeight = 1.35,
    reserveFactor = 0.15
  } = params;

  const row = hourly.find((item) => item.hour === selectedHour) ?? hourly[0];
  const weightedPassengers = row.normalCount + row.elderlyCount * elderlyWeight;
  const baseBus = Math.ceil(weightedPassengers / averageCapacityPerBus);
  const reserveBus = Math.max(1, Math.ceil(baseBus * reserveFactor));
  const recommendedBus = baseBus + reserveBus;

  return {
    row,
    weightedPassengers,
    recommendedBus,
    priorityBus: row.elderlyCount >= 8 ? 1 : 0,
    explanation: row.elderlyCount >= 8
      ? "Volume lansia tinggi, aktifkan 1 feeder prioritas dan pertahankan reserve bus."
      : "Feeder standar cukup, monitor standing elderly dan occupancy live."
  };
}

export function predictEtaByTraffic(params: {
  distanceKm: number;
  baseSpeedKmh: number;
  trafficState: TrafficState;
  trafficMultiplierMap?: Record<TrafficState, number>;
}) {
  const {
    distanceKm,
    baseSpeedKmh,
    trafficState,
    trafficMultiplierMap = {
      lancar: 1,
      sedang: 1.18,
      padat: 1.48,
      "sangat-padat": 1.9
    }
  } = params;

  const normalMinutes = (distanceKm / baseSpeedKmh) * 60;
  const adjustedMinutes = Math.round(normalMinutes * trafficMultiplierMap[trafficState]);

  return {
    trafficState,
    normalMinutes: Math.round(normalMinutes),
    adjustedMinutes,
    deltaMinutes: Math.max(0, Math.round(adjustedMinutes - normalMinutes))
  };
}

export function evaluateTransferWindow(params: {
  feederEtaMinutes: number;
  trainDepartureInMinutes: number;
  transferBufferMinutes?: number;
}) {
  const { feederEtaMinutes, trainDepartureInMinutes, transferBufferMinutes = 10 } = params;
  const lastToleratedEta = trainDepartureInMinutes - transferBufferMinutes;
  const safe = feederEtaMinutes <= lastToleratedEta;

  return {
    transferBufferMinutes,
    feederEtaMinutes,
    trainDepartureInMinutes,
    lastToleratedEta,
    safe,
    status: safe ? "Koneksi aman" : "Risiko missed connection",
    recommendation: safe
      ? "Pertahankan jadwal feeder saat ini dan tampilkan countdown normal ke penumpang."
      : "Tunda departure train/feeders yang relevan atau dispatch armada tambahan untuk menjaga transfer window."
  };
}
