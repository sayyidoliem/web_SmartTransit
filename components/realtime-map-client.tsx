"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import L, { DivIcon } from "leaflet";
import type { DashboardFilters, GpsSnapshot, StationMarker, VehicleMarker } from "@/lib/types";

function getVehicleColor(crowding: VehicleMarker["crowding"], priorityAssigned: boolean) {
  if (crowding === "Overload") return "#ff7676";
  if (priorityAssigned) return "#b495ff";
  if (crowding === "Padat") return "#f4c65a";
  return "#35c7ff";
}

function useGpsStream(filters: DashboardFilters, initialSnapshot: GpsSnapshot) {
  const [snapshot, setSnapshot] = useState<GpsSnapshot>(initialSnapshot);
  const [status, setStatus] = useState<"connecting" | "live" | "error">("connecting");

  useEffect(() => {
    setSnapshot(initialSnapshot);
  }, [initialSnapshot]);

  useEffect(() => {
    const params = new URLSearchParams({
      day: filters.day,
      hour: filters.hour,
      crowding: filters.crowding,
      priority: filters.priority
    });

    setStatus("connecting");
    const source = new EventSource(`/api/gps/stream?${params.toString()}`);

    source.addEventListener("gps", (event) => {
      try {
        const next = JSON.parse((event as MessageEvent).data) as GpsSnapshot;
        setSnapshot(next);
        setStatus("live");
      } catch {
        setStatus("error");
      }
    });

    source.onerror = () => {
      setStatus("error");
      source.close();
    };

    return () => {
      source.close();
    };
  }, [filters.day, filters.hour, filters.crowding, filters.priority]);

  return { snapshot, status };
}

const stationIcon = (type: StationMarker["type"]) => {
  const color = type === "hub" ? "#b495ff" : "#35c7ff";
  return new DivIcon({
    className: "",
    html: `<div style="width:18px;height:18px;border-radius:999px;background:${color};border:3px solid white;box-shadow:0 0 0 6px rgba(53,199,255,0.14);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
};

type RealtimeMapClientProps = {
  center: [number, number];
  zoom: number;
  stations: StationMarker[];
  routes: Array<Array<[number, number]>>;
  initialSnapshot: GpsSnapshot;
  filters: DashboardFilters;
};

export default function RealtimeMapClient({ center, zoom, stations, routes, initialSnapshot, filters }: RealtimeMapClientProps) {
  const { snapshot, status } = useGpsStream(filters, initialSnapshot);

  const liveBadgeClass = status === "live" ? "live-dot" : status === "connecting" ? "live-dot idle" : "live-dot error";

  return (
    <>
      <div className="map-overlay-top">
        <div>
          <div className="live-badge"><span className={liveBadgeClass} /> {status === "live" ? "Realtime GPS live" : status === "connecting" ? "Connecting stream..." : "Stream disconnected"}</div>
          <p className="stream-meta" style={{ marginTop: 10 }}>Snapshot {snapshot.generatedAtLabel} • visible vehicles {snapshot.vehicles.length}</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <span className="map-pill">{filters.day}</span>
          <span className="map-pill">{filters.hour}</span>
          <span className="map-pill">{filters.crowdingLabel}</span>
          <span className="map-pill">{filters.priorityLabel}</span>
        </div>
      </div>

      <div className="map-frame">
        <MapContainer center={center} zoom={zoom} scrollWheelZoom className="map-shell">
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {routes.map((points, idx) => (
            <Polyline key={`route-${idx}`} positions={points} pathOptions={{ color: idx === 0 ? "#35c7ff" : "#b495ff", weight: idx === 0 ? 6 : 4, dashArray: idx === 1 ? "10, 8" : undefined }} />
          ))}

          {stations.map((station) => (
            <Marker key={station.id} position={[station.lat, station.lng]} icon={stationIcon(station.type)}>
              <Popup>
                <strong>{station.name}</strong>
                <br />
                ETA {station.etaText}
                <br />
                Type {station.type}
              </Popup>
            </Marker>
          ))}

          {snapshot.vehicles.map((vehicle) => (
            <CircleMarker
              key={vehicle.id}
              center={[vehicle.lat, vehicle.lng]}
              radius={11}
              pathOptions={{
                color: "#ffffff",
                weight: 2,
                fillColor: getVehicleColor(vehicle.crowding, vehicle.priorityAssigned),
                fillOpacity: 0.95
              }}
            >
              <Popup>
                <strong>{vehicle.label}</strong>
                <br />
                ETA {vehicle.nextEta}
                <br />
                Crowding {vehicle.crowding}
                <br />
                {vehicle.priorityAssigned ? "Priority vehicle" : "Regular vehicle"}
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </>
  );
}
