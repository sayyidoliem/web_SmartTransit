import HourlyBars from "./hourly-bars";
import MetricCard from "./metric-card";

type FeederPanelProps = {
  selectedHour: string;
  density: {
    currentPassengers: number;
    normalCount: number;
    elderlyCount: number;
    crowdingLabel: string;
    standingElderly: number;
    hourly: Array<{ hour: string; normalCount: number; elderlyCount: number }>;
  };
  vehicles: {
    totalActiveFeeder: number;
    recommendedFeeder: number;
    priorityBus: number;
  };
};

export default function FeederPanel({ selectedHour, density, vehicles }: FeederPanelProps) {
  return (
    <section className="panel-stack">
      <div className="card panel-header-card">
        <div>
          <p className="eyebrow">A. Predict jumlah feeder/bus</p>
          <h2>Density hourly (object detection)</h2>
          <p className="panel-subtitle">Slot aktif: {selectedHour} • Normal + Lansia</p>
        </div>
        <span className={`status-pill status-${density.crowdingLabel.toLowerCase()}`}>
          {density.crowdingLabel}
        </span>
      </div>

      <div className="metrics-grid two-cols">
        <MetricCard title="Normal" value={density.normalCount} hint="Objek terdeteksi" />
        <MetricCard title="Lansia" value={density.elderlyCount} hint="Priority class" tone="warning" />
        <MetricCard
          title="Recommended Feeder"
          value={vehicles.recommendedFeeder}
          hint={`Feeder aktif saat ini ${vehicles.totalActiveFeeder}`}
          tone="success"
        />
        <MetricCard
          title="Priority Bus"
          value={vehicles.priorityBus}
          hint={`${density.standingElderly} lansia berdiri`}
          tone={density.standingElderly >= 3 ? "danger" : "default"}
        />
      </div>

      <div className="card chart-card">
        <div className="chart-head">
          <div>
            <h3>Hourly density source</h3>
            <p>Bar biru = total normal, bar hijau = lansia</p>
          </div>
        </div>
        <HourlyBars data={density.hourly} />
      </div>

      <div className="card recommendation-card">
        <h3>Dispatch recommendation</h3>
        <p>
          Prediksi slot <strong>{selectedHour}</strong> merekomendasikan <strong>{vehicles.recommendedFeeder} feeder</strong>
          {vehicles.priorityBus > 0 ? ` dengan ${vehicles.priorityBus} bus prioritas` : " tanpa bus prioritas tambahan"}.
        </p>
      </div>
    </section>
  );
}
