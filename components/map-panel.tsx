"use client";

import dynamic from "next/dynamic";
import type { DashboardFilters, GpsSnapshot, RouteShape, StationMarker } from "@/lib/types";

const RealtimeMapClient = dynamic(() => import("./realtime-map-client"), {
  ssr: false,
  loading: () => <div className="map-frame" style={{ display: "grid", placeItems: "center" }}>Loading real map…</div>
});

type MapPanelProps = {
  stations: StationMarker[];
  routes: RouteShape[];
  filters: DashboardFilters;
  initialSnapshot: GpsSnapshot;
};

export default function MapPanel({ stations, routes, filters, initialSnapshot }: MapPanelProps) {
  return (
    <div className="card map-card">
      <div className="map-head">
        <div>
          <p className="kicker"><span className="dot" /> GPS & station monitoring</p>
          <h2 className="section-title">Realtime GPS + real map</h2>
          <p className="map-meta">Peta menggunakan tile OpenStreetMap dan stream posisi armada mock real-time.</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <span className="map-pill">Stations {stations.length}</span>
          <span className="map-pill">Vehicles {initialSnapshot.vehicles.length}</span>
        </div>
      </div>

      <RealtimeMapClient
        center={[-6.2009, 106.8227]}
        zoom={13}
        stations={stations}
        routes={routes.map((route) => route.points.map((point) => [point.lat, point.lng] as [number, number]))}
        filters={filters}
        initialSnapshot={initialSnapshot}
      />

      <div className="map-footer">
        <div className="legend">
          <span className="legend-item"><span className="legend-dot" style={{ background: '#35c7ff', boxShadow: 'none' }} /> <span className="legend-text">Normal feeder</span></span>
          <span className="legend-item"><span className="legend-dot" style={{ background: '#f4c65a', boxShadow: 'none' }} /> <span className="legend-text">Padat</span></span>
          <span className="legend-item"><span className="legend-dot" style={{ background: '#ff7676', boxShadow: 'none' }} /> <span className="legend-text">Overload</span></span>
          <span className="legend-item"><span className="legend-dot" style={{ background: '#b495ff', boxShadow: 'none' }} /> <span className="legend-text">Priority vehicle</span></span>
        </div>
        <p className="helper-copy">Koordinat GPS pada demo ini bersifat sintetis namun divisualisasikan di peta nyata Jakarta.</p>
      </div>
    </div>
  );
}
