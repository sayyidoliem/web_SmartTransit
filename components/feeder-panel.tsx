import HourlyBars from "./hourly-bars";
import MetricCard from "./metric-card";
import type { DashboardState } from "@/lib/types";

export default function FeederPanel({ data }: { data: DashboardState }) {
  return (
    <section className="panel-stack">
      <div className="card panel-card">
        <div className="panel-head">
          <div>
            <p className="kicker"><span className="dot" /> A. Predict jumlah feeder/bus</p>
            <h2>Density hourly dari object detection</h2>
            <p className="panel-meta">Slot aktif: {data.filters.day} • {data.filters.hour} • normal + lansia</p>
          </div>
          <span className={`status-pill status-${data.density.crowdingLabel.toLowerCase()}`}>{data.density.crowdingLabel}</span>
        </div>

        <div className="two-col-grid">
          <MetricCard title="Normal" value={data.density.normalCount} hint="Terdeteksi dari feed object detection" />
          <MetricCard title="Lansia" value={data.density.elderlyCount} hint="Priority class aktif" tone="warning" />
          <MetricCard title="Recommended Feeder" value={data.vehicles.recommendedFeeder} hint={`Aktif saat ini ${data.vehicles.totalActiveFeeder}`} tone="success" badge="AI recommendation" />
          <MetricCard title="Priority Bus" value={data.vehicles.priorityBus} hint={`${data.density.standingElderly} lansia berdiri`} tone={data.density.standingElderly >= 3 ? "danger" : "default"} />
        </div>
      </div>

      <div className="card chart-card">
        <div className="chart-head">
          <div>
            <h3 className="section-title">Hourly density source</h3>
            <p className="subtle">Bar biru = total normal, bar hijau = total lansia pada jam tersebut.</p>
          </div>
          <span className="chip">Selected {data.filters.hour}</span>
        </div>
        <HourlyBars data={data.density.hourly} activeHour={data.filters.hour} />
      </div>

      <div className="card list-card">
        <h3 className="section-title">Dispatch recommendation</h3>
        <ul className="alert-list">
          <li className="alert-item">
            <div className="legend-dot" style={{ background: '#35c7ff', boxShadow: 'none' }} />
            <div>
              <strong>Deploy {data.vehicles.recommendedFeeder} feeder pada slot {data.filters.hour}</strong>
              <span>{data.dispatch.explanation}</span>
            </div>
          </li>
          <li className="alert-item">
            <div className="legend-dot" style={{ background: '#b495ff', boxShadow: 'none' }} />
            <div>
              <strong>Priority handling</strong>
              <span>{data.dispatch.priorityMessage}</span>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
