"use client";
import type { DashboardFilters, DashboardState } from "@/lib/types";
export default function FiltersBar({
  filters,
  options,
  onChange,
}: {
  filters: DashboardFilters;
  options: DashboardState["filterOptions"];
  onChange: (next: DashboardFilters) => void;
}) {
  function setField<K extends keyof DashboardFilters>(
    key: K,
    value: DashboardFilters[K],
  ) {
    const next = { ...filters, [key]: value };
    if (key === "date") {
      next.day = new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        timeZone: "Asia/Jakarta",
      }).format(new Date(`${value as string}T00:00:00+07:00`));
    }
    onChange(next);
  }
  return (
    <div className="card filter-card">
      <div className="filter-header">
        <div>
          <h2>Operational filters</h2>
          <p className="subtle">
            Multi-koridor, tanggal sebelumnya maupun mendatang, jam, crowding,
            dan priority.
          </p>
        </div>
        <span className="chip">Interactive control panel</span>
      </div>
      <div className="filter-grid">
        <div className="field">
          <label>Koridor</label>
          <select
            className="select"
            value={filters.corridorId}
            onChange={(e) => setField("corridorId", e.target.value)}
          >
            {(options.corridors ?? []).map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Tanggal operasional</label>
          <input
            className="date-input"
            type="date"
            value={filters.date}
            min={options.minDate}
            max={options.maxDate}
            onChange={(e) => setField("date", e.target.value)}
          />
        </div>
        <div className="field">
          <label>Hari</label>
          <select
            className="select"
            value={filters.day}
            onChange={(e) => setField("day", e.target.value)}
          >
            {options.days.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Jam</label>
          <select
            className="select"
            value={filters.hour}
            onChange={(e) => setField("hour", e.target.value)}
          >
            {options.hours.map((hour) => (
              <option key={hour} value={hour}>
                {hour}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Crowding</label>
          <select
            className="select"
            value={filters.crowding}
            onChange={(e) =>
              setField(
                "crowding",
                e.target.value as DashboardFilters["crowding"],
              )
            }
          >
            {options.crowding.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Priority</label>
          <select
            className="select"
            value={filters.priority}
            onChange={(e) =>
              setField(
                "priority",
                e.target.value as DashboardFilters["priority"],
              )
            }
          >
            {options.priority.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
