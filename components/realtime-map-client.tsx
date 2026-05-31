"use client";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";
import { DivIcon } from "leaflet";
import type { DashboardFilters, GpsSnapshot, StationMarker } from "@/lib/types";
import { useGpsStream } from "./use-gps-stream";
const stationIcon = (type: StationMarker["type"]) =>
  new DivIcon({
    className: "",
    html: `<div style="width:18px;height:18px;border-radius:999px;background:${type === "hub" ? "#b495ff" : "#38c7ff"};border:3px solid white;box-shadow:0 0 0 6px rgba(56,199,255,0.14);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
function vehicleColor(c: string, p: boolean) {
  if (c === "Overload") return "#ff7a7a";
  if (p) return "#b495ff";
  if (c === "Padat") return "#f4c65a";
  return "#38c7ff";
}
export default function RealtimeMapClient({
  center,
  zoom,
  stations,
  routes,
  initialSnapshot,
  filters,
}: {
  center: [number, number];
  zoom: number;
  stations: StationMarker[];
  routes: Array<Array<[number, number]>>;
  initialSnapshot: GpsSnapshot;
  filters: DashboardFilters;
}) {
  const { snapshot, status } = useGpsStream(filters, initialSnapshot);
  const dot =
    status === "live"
      ? "live-dot"
      : status === "connecting"
        ? "live-dot idle"
        : "live-dot error";
  return (
    <>
      <div className="map-overlay-top">
        <div>
          <div className="live-badge">
            <span className={dot} />{" "}
            {status === "live"
              ? "Realtime GPS live"
              : status === "connecting"
                ? "Connecting stream..."
                : "Stream disconnected"}
          </div>
          <p className="stream-meta" style={{ marginTop: 10 }}>
            Snapshot {snapshot.generatedAtLabel} • visible vehicles{" "}
            {snapshot.vehicles.length}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <span className="badge">{filters.corridorId}</span>
          <span className="badge">{filters.date}</span>
          <span className="badge">{filters.hour}</span>
        </div>
      </div>
      <div className="map-frame">
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom
          className="map-shell"
        >
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {routes.map((pts, idx) => (
            <Polyline
              key={idx}
              positions={pts}
              pathOptions={{
                color: idx === 0 ? "#38c7ff" : "#b495ff",
                weight: idx === 0 ? 6 : 4,
                dashArray: idx === 1 ? "10, 8" : undefined,
              }}
            />
          ))}
          {stations.map((s) => (
            <Marker
              key={s.id}
              position={[s.lat, s.lng]}
              icon={stationIcon(s.type)}
            >
              <Popup>
                <strong>{s.name}</strong>
                <br />
                ETA {s.etaText}
                <br />
                Type {s.type}
              </Popup>
            </Marker>
          ))}
          {snapshot.vehicles.map((v) => (
            <CircleMarker
              key={v.id}
              center={[v.lat, v.lng]}
              radius={11}
              pathOptions={{
                color: "#fff",
                weight: 2,
                fillColor: vehicleColor(v.crowding, v.priorityAssigned),
                fillOpacity: 0.95,
              }}
            >
              <Popup>
                <strong>{v.label}</strong>
                <br />
                ETA {v.nextEta}
                <br />
                Crowding {v.crowding}
                <br />
                {v.priorityAssigned ? "Priority vehicle" : "Regular vehicle"}
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </>
  );
}
