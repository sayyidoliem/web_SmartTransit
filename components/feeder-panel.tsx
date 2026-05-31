import type { DashboardState } from "@/lib/types";
import MetricCard from "./metric-card";
import HourlyBars from "./hourly-bars";
export default function FeederPanel({ data }: { data: DashboardState }) {
  return (
    <section className="panel-stack">
      {/* <div className="card panel-card">
        <div className="panel-head">
          <div>
            <p className="kicker">
              <span className="dot" /> A. Predict jumlah feeder/bus
            </p>
            <h2>Density hourly dari object detection</h2>
            <p className="panel-meta">
              {data.filters.corridorId} • {data.filters.date} •{" "}
              {data.filters.hour}
            </p>
          </div>
          <span
            className={`status-pill status-${data.density.crowdingLabel.toLowerCase()}`}
          >
            {data.density.crowdingLabel}
          </span>
        </div>
        <div className="two-col-grid">
          <MetricCard
            title="Normal"
            value={data.density.normalCount}
            hint="Objek terdeteksi"
          />
          <MetricCard
            title="Lansia"
            value={data.density.elderlyCount}
            hint="Priority class"
            tone="warning"
          />
          <MetricCard
            title="Recommended Feeder"
            value={data.vehicles.recommendedFeeder}
            hint={`Aktif saat ini ${data.vehicles.totalActiveFeeder}`}
            tone="success"
            badge="AI recommendation"
          />
          <MetricCard
            title="Priority Bus"
            value={data.vehicles.priorityBus}
            hint={`${data.density.standingElderly} lansia berdiri`}
            tone={data.density.standingElderly >= 3 ? "danger" : "default"}
          />
        </div>
      </div>
      <div className="card chart-card">
        <div className="chart-head">
          <div>
            <h3>Hourly density source</h3>
            <p className="subtle">Biru = total normal, hijau = lansia.</p>
          </div>
          <span className="chip">Selected {data.filters.hour}</span>
        </div>
        <HourlyBars data={data.density.hourly} activeHour={data.filters.hour} />
      </div> */}
    </section>
  );
}
