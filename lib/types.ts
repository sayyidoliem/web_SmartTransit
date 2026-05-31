export type TrafficState = "lancar" | "sedang" | "padat" | "sangat-padat";
export type CrowdingLabel = "Normal" | "Ramai" | "Padat" | "Overload";
export type CrowdingFilter = "all" | "normal" | "ramai" | "padat" | "overload";
export type PriorityFilter = "all" | "priority-only" | "non-priority";

export type HourlyDensity = {
  hour: string;
  normalCount: number;
  elderlyCount: number;
};

export type DashboardFilters = {
  crowding: CrowdingFilter;
  priority: PriorityFilter;
  hour: string;
  day: string;
  crowdingLabel: string;
  priorityLabel: string;
};

export type StationMarker = {
  id: string;
  name: string;
  type: "stop" | "hub" | "station";
  etaText: string;
  active: boolean;
  lat: number;
  lng: number;
};

export type VehicleMarker = {
  id: string;
  label: string;
  routeId: string;
  nextEta: string;
  crowding: CrowdingLabel;
  priorityAssigned: boolean;
  lat: number;
  lng: number;
  heading: number;
};

export type RouteShape = {
  id: string;
  kind: "main" | "connector";
  points: Array<{ lat: number; lng: number }>;
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

export type GpsSnapshot = {
  generatedAt: string;
  generatedAtLabel: string;
  vehicles: VehicleMarker[];
};

export type DashboardState = {
  generatedAt: string;
  generatedAtLabel: string;
  routeName: string;
  currentTimeLabel: string;
  filters: DashboardFilters;
  filterOptions: {
    days: string[];
    hours: string[];
    crowding: Array<{ value: CrowdingFilter; label: string }>;
    priority: Array<{ value: PriorityFilter; label: string }>;
  };
  vehicles: {
    totalActiveFeeder: number;
    recommendedFeeder: number;
    priorityBus: number;
  };
  density: {
    currentPassengers: number;
    normalCount: number;
    elderlyCount: number;
    standingElderly: number;
    crowdingLabel: CrowdingLabel;
    hourly: HourlyDensity[];
  };
  dispatch: {
    explanation: string;
    priorityMessage: string;
  };
  eta: {
    bus: PredictEtaResult;
    train: PredictEtaResult;
    transfer: TransferEvaluation;
  };
  stations: StationMarker[];
  map: {
    stations: StationMarker[];
    routes: RouteShape[];
  };
  gpsSnapshot: GpsSnapshot;
  alerts: Array<{ title: string; description: string; levelColor: string }>;
  apiExamples: {
    densityCurrent: unknown;
    eta: unknown;
    gpsCurrent: unknown;
    gpsStreamExample: unknown;
  };
};
