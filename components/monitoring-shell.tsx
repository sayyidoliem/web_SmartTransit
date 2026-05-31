"use client";
import Link from "next/link";
import { useCallback, useState, useTransition } from "react";
import { buildDashboardState } from "@/lib/data-source";
import type { DashboardFilters, DashboardState } from "@/lib/types";
import FiltersBar from "./filters-bar";
import MetricCard from "./metric-card";
import StationTimeline from "./station-timeline";
import MapPanel from "./map-panel";
export default function MonitoringShell({
  initialData,
}: {
  initialData: DashboardState;
}) {
  const [data, setData] = useState(initialData);
  const [filters, setFilters] = useState(initialData.filters);
  const [isPending, startTransition] = useTransition();
  const onChange = useCallback((next: DashboardFilters) => {
    setFilters(next);
    startTransition(() => setData(buildDashboardState(next)));
  }, []);
  return (
    <main className="page-shell">
      <div className="shell">
        <header className="hero">
          <div className="hero-left">
            <p className="kicker">
              <span className="dot" /> Monitoring Page
            </p>
            <h1>GPS armada, station monitoring, dan tracking halte</h1>
            <p className="hero-sub">
              Halaman ini fokus untuk operator lapangan: marker unit live,
              tracking halte, dan navigasi ke detail halte.
            </p>
          </div>
          <div className="hero-right">
            <span className="badge">Updated {data.generatedAtLabel}</span>
            <span className="badge">{data.filters.corridorId}</span>
            <span className="badge">{data.filters.date}</span>
            {isPending ? <span className="badge">Updating…</span> : null}
          </div>
        </header>
        <FiltersBar
          filters={filters}
          options={data.filterOptions}
          onChange={onChange}
        />
        <StationTimeline stations={data.stations} />
        <section className="kpi-grid">
          <MetricCard
            title="Visible vehicles"
            value={data.gpsSnapshot.vehicles.length}
            hint="Armada live di peta"
            badge="Realtime"
          />
          <MetricCard
            title="Track status"
            value={data.eta.transfer.status}
            hint="Sinkronisasi feeder ↔ rail"
            tone={data.eta.transfer.safe ? "success" : "danger"}
          />
          <MetricCard
            title="Monitoring slot"
            value={data.filters.hour}
            hint={`${data.filters.day} • ${data.filters.date}`}
            tone="warning"
          />
          <MetricCard
            title="Stations on route"
            value={data.stations.length}
            hint="Stop / hub / station"
            tone="success"
          />
        </section>
        <section className="monitoring-grid">
          <div className="left-stack">
            <MapPanel
              stations={data.stations}
              routes={data.map.routes}
              filters={data.filters}
              initialSnapshot={data.gpsSnapshot}
            />
          </div>
          <div className="right-stack">
            <div className="card list-card">
              <div className="panel-head">
                <div>
                  <p className="kicker">
                    <span className="dot" /> Tracking halte
                  </p>
                  <h2>Queue progress by stop</h2>
                </div>
                <span className="chip">Interactive list</span>
              </div>
              <ul className="alert-list">
                {data.stations.map((s, index) => (
                  <li key={s.id} className="alert-item">
                    <div
                      className="legend-dot"
                      style={{
                        background: s.type === "hub" ? "#b495ff" : "#38c7ff",
                        boxShadow: "none",
                      }}
                    />
                    <div>
                      <strong>
                        {index + 1}. {s.name}
                      </strong>
                      <span>
                        ETA {s.etaText} • Type {s.type}
                      </span>
                      <div style={{ marginTop: 8 }}>
                        <Link
                          className="link-chip"
                          href={`/halte/${s.id}?corridor=${data.filters.corridorId}`}
                        >
                          Detail halte
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
        <p className="footer-note">
          Monitoring dipisahkan agar GPS, station monitoring, dan tracking halte
          menjadi fokus tunggal.
        </p>
      </div>
    </main>
  );
}
