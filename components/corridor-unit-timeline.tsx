"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type {
  CorridorUnit,
  DashboardFilters,
  GpsSnapshot,
  StationMarker,
  VehicleMarker,
} from "@/lib/types";
import { estimateArrivalMinutes } from "@/lib/data-source";
import { useGpsStream } from "./use-gps-stream";
export default function CorridorUnitTimeline({
  corridorId,
  units,
  stations,
  filters,
  initialSnapshot,
}: {
  corridorId: string;
  units: CorridorUnit[];
  stations: StationMarker[];
  filters: DashboardFilters;
  initialSnapshot: GpsSnapshot;
}) {
  const [selected, setSelected] = useState(units[0]?.id ?? "");
  const { snapshot } = useGpsStream(filters, initialSnapshot);
  const selectedUnit = units.find((u) => u.id === selected) ?? units[0];
  const liveVehicle = snapshot.vehicles.find((v) => v.id === selectedUnit?.id);
  const arrivals = useMemo(() => {
    if (!selectedUnit) return [];
    return stations.map((s) => ({
      stationId: s.id,
      stationName: s.name,
      etaMinutes: liveVehicle
        ? estimateArrivalMinutes(
            liveVehicle,
            s,
            selectedUnit.propagatedDelayMinutes,
          )
        : Math.max(1, selectedUnit.baseEtaMinutes),
    }));
  }, [selectedUnit, stations, liveVehicle]);
  return (
    <div className="card units-card">
      <div className="units-head">
        <div>
          <p className="kicker">
            <span className="dot" /> Timeline unit berjalan
          </p>
          <h2>Klik unit untuk melihat ETA ke halte</h2>
          <p className="estimate-note">
            ETA dihitung dari GPS movement realtime mock + propagated delay.
          </p>
        </div>
        <span className="chip">{units.length} units active</span>
      </div>
      <div className="timeline-units">
        {units.map((u) => (
          <button
            key={u.id}
            className={`timeline-unit-btn ${selectedUnit?.id === u.id ? "active" : ""}`}
            onClick={() => setSelected(u.id)}
          >
            {u.label}
          </button>
        ))}
      </div>
      <div className="card arrival-card" style={{ marginTop: 16 }}>
        {selectedUnit ? (
          <>
            <div className="panel-head">
              <div>
                <p className="kicker">
                  <span className="dot" /> Selected unit
                </p>
                <h3>{selectedUnit.label}</h3>
                <p className="panel-meta">
                  {selectedUnit.crowding} • propagated delay{" "}
                  {selectedUnit.propagatedDelayMinutes} min
                </p>
              </div>
              <span className="status-pill">
                ETA base {selectedUnit.baseEtaMinutes} min
              </span>
            </div>
            <ul className="arrival-list">
              {arrivals.map((a) => (
                <li key={a.stationId} className="arrival-item">
                  <div
                    className="legend-dot"
                    style={{ background: "#38c7ff", boxShadow: "none" }}
                  />
                  <div>
                    <strong>{a.stationName}</strong>
                    <span>Perkiraan tiba dalam {a.etaMinutes} menit</span>
                    <div style={{ marginTop: 8 }}>
                      <Link
                        className="link-chip"
                        href={`/halte/${a.stationId}?corridor=${corridorId}`}
                      >
                        Detail halte
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="subtle">Tidak ada unit aktif.</p>
        )}
      </div>
    </div>
  );
}
