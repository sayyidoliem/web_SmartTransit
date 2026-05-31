"use client";

import { useCallback, useState, useTransition } from "react";
import { buildDashboardState, TODAY_DATE } from "@/lib/data-source";
import type { DashboardFilters, DashboardState } from "@/lib/types";
import FiltersBar from "./filters-bar";
import FeederPanel from "./feeder-panel";

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

  const propagatedDelayMinutes =
    data.corridorUnits?.[0]?.propagatedDelayMinutes ?? 0;

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

        <section className="kpi-panel">
          <div className="kpi-panel-head">
            <div>
              <p className="kicker">
                <span className="dot" /> Operational summary
              </p>

              <h2>Operational metrics</h2>

              <p className="kpi-panel-subtitle">
                Passengers detected, crowding status, cascading delay, dan
                visible units sesuai filter aktif.
              </p>
            </div>

            <span className="badge">Live operational insight</span>
          </div>

          <div className="kpi-vertical-list">
            <div className="kpi-row">
              <div>
                <p className="kpi-label">Passengers detected</p>
                <p className="kpi-hint">Normal + lansia</p>
              </div>

              <div className="kpi-value-wrap">
                <p className="kpi-value">{data.density.currentPassengers}</p>
              </div>
            </div>

            <div className="kpi-row">
              <div>
                <p className="kpi-label">Crowding status</p>
                <p className="kpi-hint">Status kendaraan hasil kalkulasi</p>
              </div>

              <div className="kpi-value-wrap">
                <p className="kpi-value">{data.density.crowdingLabel}</p>
              </div>
            </div>

            <div className="kpi-row">
              <div>
                <p className="kpi-label">Cascading delay</p>
                <p className="kpi-hint">Bus A → Bus B propagation</p>
              </div>

              <div className="kpi-value-wrap">
                <p
                  className={
                    propagatedDelayMinutes > 0
                      ? "kpi-value danger"
                      : "kpi-value success"
                  }
                >
                  {propagatedDelayMinutes} min
                </p>
              </div>
            </div>

            <div className="kpi-row">
              <div>
                <p className="kpi-label">Visible units</p>
                <p className="kpi-hint">Sesuai filter aktif</p>
              </div>

              <div className="kpi-value-wrap">
                <p className="kpi-value">{data.gpsSnapshot.vehicles.length}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="content-grid">
          <div className="left-stack">
            <FeederPanel data={data} />
          </div>
        </section>

        <p className="footer-note">
          Dashboard utama tetap fokus pada insight operasional inti.
        </p>
      </div>
    </main>
  );
}
