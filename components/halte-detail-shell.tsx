"use client";
import Link from "next/link";
import { useCallback, useMemo, useState, useTransition } from "react";
import { buildDashboardState, estimateArrivalMinutes } from "@/lib/data-source";
import type { DashboardFilters, DashboardState } from "@/lib/types";
import FiltersBar from "./filters-bar";
import MetricCard from "./metric-card";
import { useGpsStream } from "./use-gps-stream";
export default function HalteDetailShell({
  halteId,
  corridorId,
  initialData,
}: {
  halteId: string;
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
  const halte = data.stations.find((s) => s.id === halteId) ?? data.stations[0];
  const { snapshot } = useGpsStream(filters, data.gpsSnapshot);
  const arrivals = useMemo(
    () =>
      snapshot.vehicles
        .map((v) => {
          const unit = data.corridorUnits.find((u) => u.id === v.id);
          const delay = unit?.propagatedDelayMinutes ?? 0;
          return {
            unitLabel: v.label,
            etaMinutes: estimateArrivalMinutes(v, halte, delay),
          };
        })
        .sort((a, b) => a.etaMinutes - b.etaMinutes),
    [snapshot, halte, data.corridorUnits],
  );
  return (
    <main className="page-shell">
      <div className="shell">
        <header className="hero">
          <div className="hero-left">
            <p className="kicker">
              <span className="dot" /> Halte Detail
            </p>
            <h1>{halte.name}</h1>
            <p className="hero-sub">
              Melihat seluruh unit yang menuju halte ini, ETA per unit, dan
              dampak cascading delay dari jadwal sebelumnya.
            </p>
          </div>
          <div className="hero-right">
            <Link
              className="link-chip"
              href={`/corridor/${filters.corridorId}`}
            >
              Ke detail koridor
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
            <strong>Halte future estimate.</strong>
            <p className="estimate-note" style={{ marginTop: 8 }}>
              {data.estimateNote}
            </p>
          </div>
        ) : null}
        <section className="kpi-grid">
          <MetricCard
            title="Selected halte"
            value={halte.name}
            hint={`${halte.type} • ${halte.etaText}`}
            badge="Stop detail"
          />
          <MetricCard
            title="Approaching units"
            value={arrivals.length}
            hint="Unit aktif pada koridor terpilih"
            tone="success"
          />
          <MetricCard
            title="Nearest ETA"
            value={arrivals[0] ? `${arrivals[0].etaMinutes} min` : "-"}
            hint="Unit paling dekat"
            tone="warning"
          />
          <MetricCard
            title="Operational date"
            value={filters.date}
            hint={`${filters.day} • ${filters.hour}`}
            tone="danger"
          />
        </section>
        <section className="halte-grid">
          <div className="left-stack">
            <div className="card halte-card">
              <div className="panel-head">
                <div>
                  <p className="kicker">
                    <span className="dot" /> Incoming units
                  </p>
                  <h2>Perkiraan kedatangan ke halte</h2>
                  <p className="panel-meta">
                    Urutan unit sampai halte diperingkat dari ETA paling dekat.
                  </p>
                </div>
              </div>
              <ul className="arrival-list">
                {arrivals.map((a) => (
                  <li key={a.unitLabel} className="arrival-item">
                    <div
                      className="legend-dot"
                      style={{ background: "#38c7ff", boxShadow: "none" }}
                    />
                    <div>
                      <strong>{a.unitLabel}</strong>
                      <span>ETA ke halte ini {a.etaMinutes} menit</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="right-stack">
            <div className="card rule-card">
              <h3>Halte operational insight</h3>
              <div className="rule-row">
                <span>Koridor aktif</span>
                <strong>{filters.corridorId}</strong>
              </div>
              <div className="rule-row">
                <span>Transfer status</span>
                <strong>{data.eta.transfer.status}</strong>
              </div>
              <div className="rule-row">
                <span>Density koridor</span>
                <strong>{data.density.crowdingLabel}</strong>
              </div>
              <p className="rule-note">
                Jika unit sebelumnya terlambat 10 menit, unit berikutnya juga
                membawa estimasi keterlambatan 10 menit karena propagasi jadwal.
              </p>
            </div>
            <div className="card list-card">
              <h3>Related navigation</h3>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link
                  className="link-chip"
                  href={`/corridor/${filters.corridorId}`}
                >
                  Buka detail koridor
                </Link>
                <Link className="link-chip" href="/monitoring">
                  Buka monitoring
                </Link>
              </div>
            </div>
          </div>
        </section>
        <p className="footer-note">
          Halaman detail halte membantu operator melihat ETA aktual per unit
          pada titik halte tertentu.
        </p>
      </div>
    </main>
  );
}
