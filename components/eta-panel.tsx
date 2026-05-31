import MetricCard from "./metric-card";

type EtaPanelProps = {
  currentTimeLabel: string;
  eta: {
    bus: { adjustedMinutes: number; deltaMinutes: number; trafficState: string };
    train: { adjustedMinutes: number; deltaMinutes: number; trafficState: string };
    transfer: {
      safe: boolean;
      status: string;
      recommendation: string;
      trainDepartureInMinutes: number;
      lastToleratedEta: number;
      feederEtaMinutes: number;
    };
  };
};

export default function EtaPanel({ currentTimeLabel, eta }: EtaPanelProps) {
  return (
    <section className="panel-stack">
      <div className="card panel-header-card">
        <div>
          <p className="eyebrow">B. Predict ETA based on traffic</p>
          <h2>Traffic-aware ETA</h2>
          <p className="panel-subtitle">Window operasional: {currentTimeLabel}</p>
        </div>
        <span className={`status-pill ${eta.transfer.safe ? "status-aman" : "status-overload"}`}>
          {eta.transfer.status}
        </span>
      </div>

      <div className="metrics-grid two-cols">
        <MetricCard
          title="ETA Feeder"
          value={`${eta.bus.adjustedMinutes} min`}
          hint={`Traffic ${eta.bus.trafficState}, +${eta.bus.deltaMinutes} min`}
          tone={eta.bus.deltaMinutes >= 6 ? "danger" : "warning"}
        />
        <MetricCard
          title="ETA Train"
          value={`${eta.train.adjustedMinutes} min`}
          hint={`Traffic ${eta.train.trafficState}, +${eta.train.deltaMinutes} min`}
          tone="default"
        />
        <MetricCard
          title="Train departs in"
          value={`${eta.transfer.trainDepartureInMinutes} min`}
          hint="Countdown penumpang"
          tone="success"
        />
        <MetricCard
          title="Last tolerated feeder ETA"
          value={`${eta.transfer.lastToleratedEta} min`}
          hint="Train departure - transfer buffer"
          tone="warning"
        />
      </div>

      <div className="card simulation-card">
        <h3>Intermodal rule engine</h3>
        <div className="rule-row">
          <span>Feeder ETA</span>
          <strong>{eta.transfer.feederEtaMinutes} min</strong>
        </div>
        <div className="rule-row">
          <span>Last tolerated ETA</span>
          <strong>{eta.transfer.lastToleratedEta} min</strong>
        </div>
        <div className="rule-row total-row">
          <span>Status</span>
          <strong>{eta.transfer.status}</strong>
        </div>
        <p className="rule-note">{eta.transfer.recommendation}</p>
      </div>
    </section>
  );
}
