export default function StationTimeline({
  stations
}: {
  stations: Array<{ name: string; etaText: string; active: boolean }>;
}) {
  return (
    <div className="card timeline-card">
      <div className="timeline-track" />
      <div className="timeline-grid">
        {stations.map((station, index) => (
          <div key={`${station.name}-${index}`} className="timeline-node-wrap">
            <div className={`timeline-node ${station.active ? "is-active" : ""}`} />
            <p className="timeline-eta">{station.etaText}</p>
            <p className="timeline-name">{station.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
