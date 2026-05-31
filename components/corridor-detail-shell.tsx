"use client";
import Link from "next/link";
import { useCallback, useState, useTransition } from "react";
import { buildDashboardState } from "@/lib/data-source";
import type { DashboardFilters, DashboardState } from "@/lib/types";
import FiltersBar from "./filters-bar";
import StationTimeline from "./station-timeline";
import MetricCard from "./metric-card";
import CorridorUnitTimeline from "./corridor-unit-timeline";
export default function CorridorDetailShell({
  corridorId,
  initialData,
}: {
  corridorId: string;
  initialData: DashboardState;
}) {
  const init = {
    ...initialData,
    filters: { ...initialData.filters, corridorId },
  };
  const [data, setData] = useState(init);
  const [filters, setFilters] = useState<DashboardFilters>({
    ...init.filters,
    corridorId,
  });
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
              <span className="dot" /> Corridor Detail
            </p>
            <h1>Koridor {filters.corridorId.toUpperCase()}</h1>
            <p className="hero-sub">
              Detail koridor, unit berjalan, ETA ke halte, dan cascading delay
              jika jadwal sebelumnya terganggu.
            </p>
          </div>
          <div className="hero-right">
            <Link className="link-chip" href="/monitoring">
              Ke Monitoring
            </Link>
            {isPending ? <span className="badge">Updating…</span> : null}
          </div>
        </header>
        <FiltersBar
          filters={filters}
          options={data.filterOptions}
          onChange={onChange}
        />
        {data.estimateMode ? (
          <div className="note-card">
            <strong>Mode estimasi masa depan.</strong>
            <p className="estimate-note" style={{ marginTop: 8 }}>
              {data.estimateNote}
            </p>
          </div>
        ) : null}
        <StationTimeline stations={data.stations} />
        <section className="kpi-grid">
          <MetricCard
            title="Corridor units active"
            value={data.corridorUnits?.length ?? 0}
            hint="Unit sesuai filter operasional"
            badge="Live corridor"
          />
          <MetricCard
            title="Recommended feeder"
            value={data.vehicles.recommendedFeeder}
            hint="Slot aktif"
            tone="success"
          />
          <MetricCard
            title="Cascading delay"
            value={`${data.corridorUnits?.[0]?.propagatedDelayMinutes ?? 0} min`}
            hint="Delay turun ke unit berikutnya"
            tone={
              (data.corridorUnits?.[0]?.propagatedDelayMinutes ?? 0) > 0
                ? "danger"
                : "success"
            }
          />
          <MetricCard
            title="Operational date"
            value={data.filters.date}
            hint={`${data.filters.day} • ${data.filters.hour}`}
            tone="warning"
          />
        </section>
        <section className="corridor-grid">
          <div className="left-stack">
            <CorridorUnitTimeline
              corridorId={filters.corridorId}
              units={data.corridorUnits ?? []}
              stations={data.stations}
              filters={data.filters}
              initialSnapshot={data.gpsSnapshot}
            />
          </div>
          <div className="right-stack">
            <div className="card rule-card">
              <h3>Corridor operational notes</h3>
              <div className="rule-row">
                <span>Density status</span>
                <strong>{data.density.crowdingLabel}</strong>
              </div>
              <div className="rule-row">
                <span>ETA feeder</span>
                <strong>{data.eta.bus.adjustedMinutes} min</strong>
              </div>
              <div className="rule-row">
                <span>ETA train</span>
                <strong>{data.eta.train.adjustedMinutes} min</strong>
              </div>
              <div className="rule-row">
                <span>Transfer status</span>
                <strong>{data.eta.transfer.status}</strong>
              </div>
              <p className="rule-note">
                Jika Bus A terlambat 10 menit, maka Bus B mewarisi estimasi
                keterlambatan 10 menit hingga ada normalisasi jadwal.
              </p>
            </div>
            <div className="card list-card">
              <h3>Units summary</h3>
              <ul className="alert-list">
                {(data.corridorUnits ?? []).map((u) => (
                  <li key={u.id} className="alert-item">
                    <div
                      className="legend-dot"
                      style={{
                        background: u.priorityAssigned ? "#b495ff" : "#38c7ff",
                        boxShadow: "none",
                      }}
                    />
                    <div>
                      <strong>{u.label}</strong>
                      <span>
                        {u.crowding} • ETA base {u.baseEtaMinutes} menit •
                        propagated delay {u.propagatedDelayMinutes} menit
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
        <p className="footer-note">
          Halaman koridor membantu dispatcher fokus pada satu koridor dan ETA
          per unit.
        </p>
      </div>
    </main>
  );
}
