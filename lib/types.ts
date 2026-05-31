export type HourlyDensity = {
  hour: string;
  normalCount: number;
  elderlyCount: number;
};

export type TrafficState = "lancar" | "sedang" | "padat" | "sangat-padat";

export type PredictFeederResult = {
  selectedHour: string;
  normalCount: number;
  elderlyCount: number;
  weightedPassengers: number;
  recommendedBus: number;
  priorityBus: number;
  explanation: string;
};

export type PredictEtaResult = {
  trafficState: TrafficState;
  normalMinutes: number;
  adjustedMinutes: number;
  deltaMinutes: number;
};

export type TransferEvaluation = {
  transferBufferMinutes: number;
  feederEtaMinutes: number;
  trainDepartureInMinutes: number;
  lastToleratedEta: number;
  safe: boolean;
  status: string;
  recommendation: string;
};

export type DashboardState = {
  generatedAt: string;
  routeName: string;
  selectedHour: string;
  currentTimeLabel: string;
  vehicles: {
    totalActiveFeeder: number;
    recommendedFeeder: number;
    priorityBus: number;
  };
  density: {
    currentPassengers: number;
    normalCount: number;
    elderlyCount: number;
    crowdingLabel: string;
    standingElderly: number;
    hourly: HourlyDensity[];
  };
  eta: {
    bus: PredictEtaResult;
    train: PredictEtaResult;
    transfer: TransferEvaluation;
  };
  alerts: string[];
  stations: Array<{ name: string; etaText: string; active: boolean }>;
  apiExamples: {
    densityCurrent: unknown;
    densityHourly: unknown;
    eta: unknown;
    intermodalRequest: unknown;
  };
};
