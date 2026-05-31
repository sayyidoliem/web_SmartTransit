import type { StationMarker } from "@/lib/types";
export default function StationTimeline({
  stations,
}: {
  stations: StationMarker[];
}) {
  return (
    <div className="card timeline-card">
      <div className="timeline-line" />
      <div className="timeline-grid">
        {stations.map((s) => (
          <div key={s.id} className="timeline-node-wrap">
            <div className={`timeline-node ${s.active ? "is-active" : ""}`} />
            <p className="timeline-eta">{s.etaText}</p>
            <p className="timeline-name">{s.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
