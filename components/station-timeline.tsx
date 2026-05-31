import type { StationMarker } from "@/lib/types";

export default function StationTimeline({ stations }: { stations: StationMarker[] }) {
  return (
    <div className="card timeline-card">
      <div className="timeline-line" />
      <div className="timeline-grid">
        {stations.map((station) => (
          <div key={station.id} className="timeline-node-wrap">
            <div className={`timeline-node ${station.active ? "is-active" : ""}`} />
            <p className="timeline-eta">{station.etaText}</p>
            <p className="timeline-name">{station.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
