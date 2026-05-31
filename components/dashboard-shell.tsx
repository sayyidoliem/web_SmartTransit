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

  const getUnitMode = (
    vehicle: DashboardState["gpsSnapshot"]["vehicles"][number],
  ) => {
    const source = `${vehicle.label} ${vehicle.routeId}`.toLowerCase();

    if (source.includes("mrt")) return "MRT";
    if (source.includes("lrt")) return "LRT";

    if (
      source.includes("mikro") ||
      source.includes("jak") ||
      source.includes("angkot")
    ) {
      return "Mikrotrans";
    }

    return "Bus";
  };

  const getConnectedRailMode = () => {
    const source = data.routeName.toLowerCase();

    if (source.includes("mrt")) return "MRT";
    if (source.includes("lrt")) return "LRT";

    return "Intermodal";
  };

  const getCorridorUnitByVehicleId = (vehicleId: string) =>
    data.corridorUnits.find((unit) => unit.id === vehicleId);

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

        <section className="unit-list-panel">
          <div className="unit-list-head">
            <div>
              <p className="kicker">
                <span className="dot" /> Operational units
              </p>

              <h2>Unit operasional terhubung</h2>

              <p className="unit-list-subtitle">
                Daftar unit seperti bus, mikrotrans, LRT, atau MRT yang
                mengikuti koridor, jam, crowding, dan priority filter aktif.
              </p>
            </div>

            <span className="badge">
              {data.gpsSnapshot.vehicles.length} unit aktif
            </span>
          </div>

          <div className="unit-filter-context">
            <span className="unit-chip">{data.filters.corridorId}</span>
            <span className="unit-chip">{data.filters.date}</span>
            <span className="unit-chip">{data.filters.hour}</span>
            <span className="unit-chip">{data.filters.crowdingLabel}</span>
            <span className="unit-chip">{data.filters.priorityLabel}</span>
            <span className="unit-chip">
              Connected to {getConnectedRailMode()}
            </span>
          </div>

          <div className="unit-vertical-list">
            {data.gpsSnapshot.vehicles.length > 0 ? (
              data.gpsSnapshot.vehicles.map((vehicle) => {
                const unitMode = getUnitMode(vehicle);
                const corridorUnit = getCorridorUnitByVehicleId(vehicle.id);
                const delayMinutes = corridorUnit?.propagatedDelayMinutes ?? 0;
                const baseEtaMinutes = corridorUnit?.baseEtaMinutes;

                return (
                  <article className="unit-card" key={vehicle.id}>
                    <div className="unit-card-main">
                      <div className="unit-icon">{unitMode}</div>

                      <div>
                        <p className="unit-name">{vehicle.label}</p>

                        <p className="unit-meta">
                          {vehicle.routeId} · {data.currentTimeLabel}
                        </p>
                      </div>
                    </div>

                    <div className="unit-card-detail">
                      <span className="unit-chip">
                        GPS ETA {vehicle.nextEta}
                      </span>

                      {typeof baseEtaMinutes === "number" ? (
                        <span className="unit-chip">
                          Operational ETA {baseEtaMinutes} min
                        </span>
                      ) : null}

                      <span
                        className={
                          vehicle.crowding === "Padat" ||
                          vehicle.crowding === "Overload"
                            ? "unit-chip danger"
                            : vehicle.crowding === "Ramai"
                              ? "unit-chip warning"
                              : "unit-chip success"
                        }
                      >
                        {vehicle.crowding}
                      </span>

                      <span
                        className={
                          vehicle.priorityAssigned
                            ? "unit-chip priority"
                            : "unit-chip"
                        }
                      >
                        {vehicle.priorityAssigned
                          ? "Priority assigned"
                          : "Non-priority"}
                      </span>

                      <span
                        className={
                          delayMinutes > 0
                            ? "unit-chip danger"
                            : "unit-chip success"
                        }
                      >
                        Delay {delayMinutes} min
                      </span>

                      <span className="unit-chip">
                        Heading {Math.round(vehicle.heading)}°
                      </span>

                      <span className="unit-chip">
                        Connect {getConnectedRailMode()}
                      </span>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="empty-unit-card">
                Tidak ada unit yang terlihat untuk kombinasi koridor, crowding,
                dan priority filter saat ini.
              </div>
            )}
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
