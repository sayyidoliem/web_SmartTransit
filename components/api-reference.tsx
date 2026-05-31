import type { DashboardState } from "@/lib/types";

export default function ApiReference({ api }: { api: DashboardState["apiExamples"] }) {
  return (
    <div className="card api-card">
      <div className="panel-head" style={{ marginBottom: 0 }}>
        <div>
          <p className="kicker"><span className="dot" /> Developer handoff</p>
          <h2>API payload examples</h2>
          <p className="panel-meta">Siap diganti ke backend Python, YOLO, GTFS, traffic API, dan GPS nyata.</p>
        </div>
        <span className="chip">Mock routes ready</span>
      </div>

      <div className="api-grid" style={{ marginTop: 16 }}>
        <div className="card api-card">
          <h3 className="section-title">GET /api/density/current</h3>
          <p className="kv-sub">Output current object detection</p>
          <code>{JSON.stringify(api.densityCurrent, null, 2)}</code>
        </div>
        <div className="card api-card">
          <h3 className="section-title">GET /api/eta</h3>
          <p className="kv-sub">ETA feeder + train</p>
          <code>{JSON.stringify(api.eta, null, 2)}</code>
        </div>
        <div className="card api-card">
          <h3 className="section-title">GET /api/gps/current</h3>
          <p className="kv-sub">Snapshot GPS yang sama dengan peta</p>
          <code>{JSON.stringify(api.gpsCurrent, null, 2)}</code>
        </div>
        <div className="card api-card">
          <h3 className="section-title">GET /api/gps/stream</h3>
          <p className="kv-sub">Server-Sent Events untuk pergerakan armada</p>
          <code>{JSON.stringify(api.gpsStreamExample, null, 2)}</code>
        </div>
      </div>
    </div>
  );
}
