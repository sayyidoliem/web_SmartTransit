export default function MetricCard({
  title,
  value,
  hint,
  tone = "default",
  badge,
}: {
  title: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger";
  badge?: string;
}) {
  return (
    <div className={`card metric-card tone-${tone}`}>
      <div className="metric-top">
        <p className="metric-title">{title}</p>
        {badge ? <span className="badge">{badge}</span> : null}
      </div>
      <h3 className="metric-value">{value}</h3>
      {hint ? <p className="metric-hint">{hint}</p> : null}
    </div>
  );
}
