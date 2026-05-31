type HourlyBarsProps = {
  data: Array<{ hour: string; normalCount: number; elderlyCount: number }>;
  activeHour: string;
};

export default function HourlyBars({ data, activeHour }: HourlyBarsProps) {
  const max = Math.max(...data.map((d) => d.normalCount + d.elderlyCount));

  return (
    <div className="hourly-bars">
      {data.map((item) => {
        const total = item.normalCount + item.elderlyCount;
        const totalHeight = (total / max) * 100;
        const elderlyHeight = (item.elderlyCount / max) * 100;
        const isActive = item.hour === activeHour;

        return (
          <div key={item.hour} className="bar-item" aria-current={isActive}>
            <div className="bar-stack" style={{ filter: isActive ? "drop-shadow(0 0 14px rgba(53,199,255,0.3))" : "none" }}>
              <div className="bar-total" style={{ height: `${totalHeight}%`, opacity: isActive ? 1 : 0.72 }} />
              <div className="bar-elderly" style={{ height: `${elderlyHeight}%`, opacity: isActive ? 1 : 0.82 }} />
            </div>
            <span className="bar-label">{item.hour}</span>
          </div>
        );
      })}
    </div>
  );
}
