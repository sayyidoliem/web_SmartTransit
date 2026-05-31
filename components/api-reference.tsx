type ApiReferenceProps = {
  examples: {
    densityCurrent: unknown;
    densityHourly: unknown;
    eta: unknown;
    intermodalRequest: unknown;
  };
};

export default function ApiReference({ examples }: ApiReferenceProps) {
  return (
    <section className="panel-stack">
      <div className="card panel-header-card">
        <div>
          <p className="eyebrow">Developer handoff</p>
          <h2>API payload examples</h2>
          <p className="panel-subtitle">Tinggal sambungkan ke backend Python/FastAPI atau service model</p>
        </div>
      </div>

      <div className="api-grid">
        <div className="card api-card">
          <h4>GET /api/density/current</h4>
          <p className="kv-sub">Output object detection saat ini</p>
          <code>{JSON.stringify(examples.densityCurrent, null, 2)}</code>
        </div>

        <div className="card api-card">
          <h4>GET /api/density/hourly</h4>
          <p className="kv-sub">Agregasi hourly untuk prediksi feeder</p>
          <code>{JSON.stringify(examples.densityHourly, null, 2)}</code>
        </div>

        <div className="card api-card">
          <h4>GET /api/eta?routeId=feeder-1a</h4>
          <p className="kv-sub">ETA traffic-aware untuk feeder / train</p>
          <code>{JSON.stringify(examples.eta, null, 2)}</code>
        </div>

        <div className="card api-card">
          <h4>POST /api/intermodal/evaluate</h4>
          <p className="kv-sub">Body request untuk evaluasi transfer window</p>
          <code>{JSON.stringify(examples.intermodalRequest, null, 2)}</code>
        </div>
      </div>

      <div className="card">
        <h3>Tips integrasi</h3>
        <p className="tip">
          Ganti sumber data di route handler atau langsung di <strong>lib/mock-data.ts</strong> ketika backend YOLO, traffic API,
          atau GTFS-RT sudah tersedia.
        </p>
      </div>
    </section>
  );
}
