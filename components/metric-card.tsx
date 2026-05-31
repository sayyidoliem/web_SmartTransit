export default function MetricCard({
  title,
  value,
  hint,
  tone = "default"
}: {
  title: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  return (
    <div className={`card metric-card tone-${tone}`}>
      <p className="metric-title">{title}</p>
      <h3 className="metric-value">{value}</h3>
      {hint ? <p className="metric-hint">{hint}</p> : null}
    </div>
  );
}
