"use client";
import dynamic from "next/dynamic";
import type {
  DashboardFilters,
  GpsSnapshot,
  RouteShape,
  StationMarker,
} from "@/lib/types";
const RealtimeMapClient = dynamic(() => import("./realtime-map-client"), {
  ssr: false,
  loading: () => (
    <div
      className="map-frame"
      style={{ display: "grid", placeItems: "center" }}
    >
      Loading real map…
    </div>
  ),
});
export default function MapPanel({
  stations,
  routes,
  filters,
  initialSnapshot,
}: {
  stations: StationMarker[];
  routes: RouteShape[];
  filters: DashboardFilters;
  initialSnapshot: GpsSnapshot;
}) {
  const center: [number, number] = stations[0]
    ? [stations[0].lat, stations[0].lng]
    : [-6.2, 106.82];
  return (
    <div className="card map-card">
      <div className="map-head">
        <div>
          <p className="kicker">
            <span className="dot" /> GPS & station monitoring
          </p>
          <h2>Realtime GPS + real map</h2>
          <p className="map-meta">
            Peta nyata Jakarta dengan marker armada dan station monitoring.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <span className="badge">Stations {stations.length}</span>
          <span className="badge">
            Vehicles {initialSnapshot.vehicles.length}
          </span>
        </div>
      </div>
      <RealtimeMapClient
        center={center}
        zoom={13}
        stations={stations}
        routes={routes.map((r) =>
          r.points.map((p) => [p.lat, p.lng] as [number, number]),
        )}
        filters={filters}
        initialSnapshot={initialSnapshot}
      />
      <div className="map-footer">
        <div className="legend">
          <span className="legend-item">
            <span
              className="legend-dot"
              style={{ background: "#38c7ff", boxShadow: "none" }}
            />{" "}
            <span className="legend-text">Normal feeder</span>
          </span>
          <span className="legend-item">
            <span
              className="legend-dot"
              style={{ background: "#f4c65a", boxShadow: "none" }}
            />{" "}
            <span className="legend-text">Padat</span>
          </span>
          <span className="legend-item">
            <span
              className="legend-dot"
              style={{ background: "#ff7a7a", boxShadow: "none" }}
            />{" "}
            <span className="legend-text">Overload</span>
          </span>
          <span className="legend-item">
            <span
              className="legend-dot"
              style={{ background: "#b495ff", boxShadow: "none" }}
            />{" "}
            <span className="legend-text">Priority</span>
          </span>
        </div>
        <p className="helper-copy">
          Koordinat GPS bersifat mock realtime namun divisualisasikan di peta
          nyata.
        </p>
      </div>
    </div>
  );
}
