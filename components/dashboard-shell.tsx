"use client";
import Link from "next/link";
import { useCallback, useState, useTransition } from "react";
import { buildDashboardState, TODAY_DATE } from "@/lib/data-source";
import type { DashboardFilters, DashboardState } from "@/lib/types";
import FiltersBar from "./filters-bar";
import MetricCard from "./metric-card";
import FeederPanel from "./feeder-panel";
import EtaPanel from "./eta-panel";
export default function DashboardShell({
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
              <span className="dot" /> Operational Dashboard
            </p>
            <h1>{data.routeName}</h1>
            <p className="hero-sub">
              Dashboard utama memusatkan prediksi feeder, ETA traffic-aware,
              multi-koridor, dan efek cascading delay antar unit.
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
        {data.filters.date > TODAY_DATE ? (
          <div className="note-card">
            <strong>Mode estimasi tanggal mendatang.</strong>
            <p className="estimate-note" style={{ marginTop: 8 }}>
              {data.estimateNote}
            </p>
          </div>
        ) : null}
        <section className="kpi-grid">
          <MetricCard
            title="Passengers detected"
            value={data.density.currentPassengers}
            hint="Normal + lansia"
            badge="Object detection"
          />
          <MetricCard
            title="Crowding status"
            value={data.density.crowdingLabel}
            hint="Status kendaraan hasil kalkulasi"
            tone="warning"
          />
          <MetricCard
            title="Cascading delay"
            value={`${data.corridorUnits?.[0]?.propagatedDelayMinutes ?? 0} min`}
            hint="Bus A → Bus B propagation"
            tone={
              (data.corridorUnits?.[0]?.propagatedDelayMinutes ?? 0) > 0
                ? "danger"
                : "success"
            }
          />
          <MetricCard
            title="Visible units"
            value={data.gpsSnapshot.vehicles.length}
            hint="Sesuai filter aktif"
            tone="success"
          />
        </section>
        <section className="content-grid">
          <div className="left-stack">
            <FeederPanel data={data} />
          </div>
          <div className="right-stack">
            <EtaPanel data={data} />
            <div className="card list-card">
              <div className="panel-head">
                <div>
                  <p className="kicker">
                    <span className="dot" /> Quick navigation
                  </p>
                  <h2>Buka detail lanjut</h2>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link
                  className="link-chip"
                  href={`/corridor/${data.filters.corridorId}`}
                >
                  Detail koridor
                </Link>
                {data.stations.map((s) => (
                  <Link
                    key={s.id}
                    className="link-chip"
                    href={`/halte/${s.id}?corridor=${data.filters.corridorId}`}
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
        <p className="footer-note">
          Dashboard utama tetap fokus pada insight operasional inti.
        </p>
      </div>
    </main>
  );
}
