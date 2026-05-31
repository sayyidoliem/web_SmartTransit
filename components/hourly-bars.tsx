type HourlyBarsProps = {
  data: Array<{
    hour: string;
    normalCount: number;
    elderlyCount: number;
  }>;
};

export default function HourlyBars({ data }: HourlyBarsProps) {
  const max = Math.max(...data.map((d) => d.normalCount + d.elderlyCount));

  return (
    <div className="hourly-bars">
      {data.map((item) => {
        const total = item.normalCount + item.elderlyCount;
        const totalHeight = (total / max) * 100;
        const elderlyHeight = (item.elderlyCount / max) * 100;

        return (
          <div key={item.hour} className="bar-item">
            <div className="bar-stack">
              <div className="bar-total" style={{ height: `${totalHeight}%` }} />
              <div className="bar-elderly" style={{ height: `${elderlyHeight}%` }} />
            </div>
            <span className="bar-label">{item.hour}</span>
          </div>
        );
      })}
    </div>
  );
}
