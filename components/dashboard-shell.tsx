"use client";

import { useCallback, useState, useTransition } from "react";
import ApiReference from "./api-reference";
import EtaPanel from "./eta-panel";
import FeederPanel from "./feeder-panel";
import FiltersBar from "./filters-bar";
import MapPanel from "./map-panel";
import MetricCard from "./metric-card";
import StationTimeline from "./station-timeline";
import { buildDashboardState } from "@/lib/mock-data";
import type { DashboardFilters, DashboardState } from "@/lib/types";

export default function DashboardShell({ initialData }: { initialData: DashboardState }) {
  const [data, setData] = useState<DashboardState>(initialData);
  const [filters, setFilters] = useState<DashboardFilters>(initialData.filters);
  const [isPending, startTransition] = useTransition();

  const handleFiltersChange = useCallback((nextFilters: DashboardFilters) => {
    setFilters(nextFilters);
    startTransition(() => {
      const nextData = buildDashboardState(nextFilters);
      setData(nextData);
    });
  }, []);

  return (
    <main className="dashboard-page">
      <div className="shell">
        <header className="hero">
          <div className="hero-left">
            <p className="kicker"><span className="dot" /> SmartTransit Jakarta Pro</p>
            <h1>{data.routeName}</h1>
            <p className="hero-sub">
              Dashboard operasional profesional untuk prediksi feeder berbasis density hourly, ETA berbasis traffic,
              intermodal monitoring, serta pemantauan GPS armada secara real-time di peta Jakarta.
            </p>
          </div>
          <div className="hero-right">
            <span className="badge">Updated {data.generatedAtLabel}</span>
            <span className="badge">{data.filters.day}</span>
            <span className="badge">{data.filters.hour}</span>
            {isPending ? <span className="badge">Updating…</span> : null}
          </div>
        </header>

        <FiltersBar filters={filters} options={data.filterOptions} onChange={handleFiltersChange} />
        <StationTimeline stations={data.stations} />

        <section className="kpi-grid">
          <MetricCard title="Passengers detected" value={data.density.currentPassengers} hint="Normal + lansia" badge="Object detection" />
          <MetricCard title="Crowding status" value={data.density.crowdingLabel} hint="Status kendaraan hasil kalkulasi" tone="warning" />
          <MetricCard title="Standing elderly" value={data.density.standingElderly} hint="Priority monitoring" tone="danger" />
          <MetricCard title="Visible vehicles" value={data.gpsSnapshot.vehicles.length} hint="Setelah filter crowding/priority" tone="success" />
        </section>

        <section className="content-grid">
          <div className="left-stack">
            <MapPanel stations={data.stations} routes={data.map.routes} filters={data.filters} initialSnapshot={data.gpsSnapshot} />
            <ApiReference api={data.apiExamples} />
          </div>

          <div className="right-stack">
            <FeederPanel data={data} />
            <EtaPanel data={data} />
          </div>
        </section>

        <p className="footer-note">Prototype siap dipakai • realtime GPS stream • real map OpenStreetMap • filters operasional aktif</p>
      </div>
    </main>
  );
}
