import ApiReference from "./api-reference";
import EtaPanel from "./eta-panel";
import FeederPanel from "./feeder-panel";
import MetricCard from "./metric-card";
import StationTimeline from "./station-timeline";
import type { DashboardState } from "@/lib/types";

export default function DashboardShell({ data }: { data: DashboardState }) {
  return (
    <main className="dashboard-page">
      <div className="dashboard-shell">
        <header className="hero-header">
          <div>
            <p className="eyebrow">SmartTransit Jakarta</p>
            <h1>{data.routeName}</h1>
            <p className="hero-subtitle">
              Dashboard operasional untuk prediksi feeder berdasarkan density hourly dan ETA berbasis traffic.
            </p>
          </div>
          <div className="header-badges">
            <span className="badge">Updated {new Date(data.generatedAt).toLocaleTimeString("id-ID")}</span>
            <span className="badge">Real-time Prototype</span>
          </div>
        </header>

        <StationTimeline stations={data.stations} />

        <section className="top-metrics">
          <MetricCard title="Passengers detected" value={data.density.currentPassengers} hint="Normal + lansia" />
          <MetricCard title="Crowding status" value={data.density.crowdingLabel} hint="Kapasitas operasional" tone="warning" />
          <MetricCard title="Standing elderly" value={data.density.standingElderly} hint="Priority monitoring" tone="danger" />
          <MetricCard title="Current slot" value={data.currentTimeLabel} hint="Window prediksi" tone="success" />
        </section>

        <section className="content-grid">
          <FeederPanel selectedHour={data.selectedHour} density={data.density} vehicles={data.vehicles} />

          <div className="right-stack">
            <EtaPanel currentTimeLabel={data.currentTimeLabel} eta={data.eta} />
            <div className="card alert-card">
              <h3>Live alerts</h3>
              <ul>
                {data.alerts.map((alert, index) => (
                  <li key={`${alert}-${index}`}>{alert}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <ApiReference examples={data.apiExamples} />

        <p className="footer-note">Prototype siap pakai • Next.js App Router • Mock data dapat langsung diganti ke backend nyata</p>
      </div>
    </main>
  );
}
