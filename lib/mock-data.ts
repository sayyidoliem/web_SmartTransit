import { evaluateTransferWindow, getCrowdingLabel, predictEtaByTraffic, predictFeederCount } from "./predict";
import type { DashboardState, HourlyDensity } from "./types";

const hourlyDensity: HourlyDensity[] = [
  { hour: "06:00", normalCount: 38, elderlyCount: 6 },
  { hour: "07:00", normalCount: 52, elderlyCount: 9 },
  { hour: "08:00", normalCount: 48, elderlyCount: 7 },
  { hour: "09:00", normalCount: 24, elderlyCount: 3 },
  { hour: "10:00", normalCount: 20, elderlyCount: 2 },
  { hour: "11:00", normalCount: 27, elderlyCount: 4 },
  { hour: "12:00", normalCount: 31, elderlyCount: 5 },
  { hour: "13:00", normalCount: 28, elderlyCount: 4 },
  { hour: "14:00", normalCount: 26, elderlyCount: 3 },
  { hour: "15:00", normalCount: 33, elderlyCount: 5 },
  { hour: "16:00", normalCount: 41, elderlyCount: 6 },
  { hour: "17:00", normalCount: 55, elderlyCount: 10 },
  { hour: "18:00", normalCount: 47, elderlyCount: 8 }
];

export async function getHourlyDensity() {
  return hourlyDensity;
}

export async function getCurrentDensity() {
  return {
    normalCount: 55,
    elderlyCount: 10,
    standingElderly: 3,
    timestamp: new Date().toISOString()
  };
}

export async function getEtaStateForRoute(routeId: string) {
  const busEta = predictEtaByTraffic({
    distanceKm: routeId === "feeder-1a" ? 8.2 : 6.4,
    baseSpeedKmh: routeId === "feeder-1a" ? 28 : 30,
    trafficState: routeId === "feeder-1a" ? "padat" : "sedang"
  });

  const trainEta = predictEtaByTraffic({
    distanceKm: 4.4,
    baseSpeedKmh: 38,
    trafficState: "sedang"
  });

  const transfer = evaluateTransferWindow({
    feederEtaMinutes: busEta.adjustedMinutes,
    trainDepartureInMinutes: trainEta.adjustedMinutes + 6,
    transferBufferMinutes: 10
  });

  return {
    routeId,
    bus: busEta,
    train: trainEta,
    transfer
  };
}

export async function getDashboardState(): Promise<DashboardState> {
  const selectedHour = "17:00";

  const feederPrediction = predictFeederCount({
    hourly: hourlyDensity,
    selectedHour,
    averageCapacityPerBus: 40,
    elderlyWeight: 1.35,
    reserveFactor: 0.2
  });

  const busEta = predictEtaByTraffic({
    distanceKm: 8.2,
    baseSpeedKmh: 28,
    trafficState: "padat"
  });

  const trainEta = predictEtaByTraffic({
    distanceKm: 4.4,
    baseSpeedKmh: 38,
    trafficState: "sedang"
  });

  const transfer = evaluateTransferWindow({
    feederEtaMinutes: busEta.adjustedMinutes,
    trainDepartureInMinutes: trainEta.adjustedMinutes + 6,
    transferBufferMinutes: 10
  });

  const currentPassengers = feederPrediction.normalCount + feederPrediction.elderlyCount;
  const busCapacity = feederPrediction.recommendedBus * 40;
  const loadRatio = currentPassengers / busCapacity;

  return {
    generatedAt: new Date().toISOString(),
    routeName: "Hub Dukuh Atas → Feeder 1A → MRT",
    selectedHour,
    currentTimeLabel: "16:00–17:00",
    vehicles: {
      totalActiveFeeder: 5,
      recommendedFeeder: feederPrediction.recommendedBus,
      priorityBus: feederPrediction.priorityBus
    },
    density: {
      currentPassengers,
      normalCount: feederPrediction.normalCount,
      elderlyCount: feederPrediction.elderlyCount,
      crowdingLabel: getCrowdingLabel(loadRatio),
      standingElderly: feederPrediction.elderlyCount >= 8 ? 3 : 1,
      hourly: hourlyDensity
    },
    eta: {
      bus: busEta,
      train: trainEta,
      transfer
    },
    alerts: [
      feederPrediction.elderlyCount >= 8
        ? "Lansia tinggi pada jam puncak, aktifkan feeder prioritas."
        : "Distribusi lansia normal.",
      transfer.safe
        ? "Koneksi feeder ke MRT aman."
        : "Koneksi berisiko, evaluasi delay atau dispatch tambahan.",
      busEta.trafficState === "padat"
        ? "Traffic padat memengaruhi ETA feeder."
        : "Traffic masih terkendali."
    ],
    stations: [
      { name: "Terminal A", etaText: "now", active: true },
      { name: "Stop B", etaText: `${Math.max(2, Math.round(busEta.adjustedMinutes / 3))} min`, active: true },
      { name: "Hub C", etaText: `${Math.max(5, Math.round(busEta.adjustedMinutes - 5))} min`, active: false },
      { name: "MRT", etaText: `${trainEta.adjustedMinutes} min`, active: false }
    ],
    apiExamples: {
      densityCurrent: await getCurrentDensity(),
      densityHourly: await getHourlyDensity(),
      eta: await getEtaStateForRoute("feeder-1a"),
      intermodalRequest: {
        feederEtaMinutes: 22,
        trainDepartureInMinutes: 25,
        transferBufferMinutes: 10
      }
    }
  };
}
