import type { DashboardState } from "@/lib/types";
import MetricCard from "./metric-card";
export default function EtaPanel({ data }: { data: DashboardState }) {
  return (
    <section className="panel-stack">
      {/* <div className="card panel-card">
        <div className="panel-head">
          <div>
            <p className="kicker">
              <span className="dot" /> B. Predict ETA berdasarkan traffic
            </p>
            <h2>Traffic-aware ETA & intermodal window</h2>
            <p className="panel-meta">{data.currentTimeLabel}</p>
          </div>
          <span
            className={`status-pill ${data.eta.transfer.safe ? "status-aman" : "status-danger"}`}
          >
            {data.eta.transfer.status}
          </span>
        </div>
        <div className="two-col-grid">
          <MetricCard
            title="ETA Feeder"
            value={`${data.eta.bus.adjustedMinutes} min`}
            hint={`Traffic ${data.eta.bus.trafficState}, +${data.eta.bus.deltaMinutes} min`}
            tone={data.eta.bus.deltaMinutes >= 6 ? "danger" : "warning"}
          />
          <MetricCard
            title="ETA Train"
            value={`${data.eta.train.adjustedMinutes} min`}
            hint={`Traffic ${data.eta.train.trafficState}, +${data.eta.train.deltaMinutes} min`}
          />
          <MetricCard
            title="Train departs in"
            value={`${data.eta.transfer.trainDepartureInMinutes} min`}
            hint="Passenger countdown"
            tone="success"
          />
          <MetricCard
            title="Last tolerated ETA"
            value={`${data.eta.transfer.lastToleratedEta} min`}
            hint="Train departure - transfer buffer"
            tone="warning"
          />
        </div>
      </div>
      <div className="card rule-card">
        <h3>Intermodal rule engine</h3>
        <div className="rule-row">
          <span>Feeder ETA</span>
          <strong>{data.eta.transfer.feederEtaMinutes} min</strong>
        </div>
        <div className="rule-row">
          <span>Last tolerated ETA</span>
          <strong>{data.eta.transfer.lastToleratedEta} min</strong>
        </div>
        <div className="rule-row">
          <span>Transfer buffer</span>
          <strong>{data.eta.transfer.transferBufferMinutes} min</strong>
        </div>
        <div className="rule-row">
          <span>Status</span>
          <strong>{data.eta.transfer.status}</strong>
        </div>
        <p className="rule-note">{data.eta.transfer.recommendation}</p>
      </div>
      <div className="card list-card">
        <h3>Live alerts</h3>
        <ul className="alert-list">
          {data.alerts.map((a) => (
            <li key={a.title} className="alert-item">
              <div
                className="legend-dot"
                style={{ background: a.levelColor, boxShadow: "none" }}
              />
              <div>
                <strong>{a.title}</strong>
                <span>{a.description}</span>
              </div>
            </li>
          ))}
        </ul>
      </div> */}
    </section>
  );
}
