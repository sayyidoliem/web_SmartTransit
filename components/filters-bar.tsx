"use client";

import type { DashboardFilters, DashboardState } from "@/lib/types";

type FiltersBarProps = {
  filters: DashboardFilters;
  options: DashboardState["filterOptions"];
  onChange: (next: DashboardFilters) => void;
};

export default function FiltersBar({ filters, options, onChange }: FiltersBarProps) {
  function updateField<K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="card filter-card">
      <div className="filter-header">
        <div>
          <h2>Operational filters</h2>
          <p className="subtle">Pilih crowding status, priority, jam, dan hari untuk menyesuaikan rekomendasi operasional serta stream GPS.</p>
        </div>
        <span className="chip">Interactive control panel</span>
      </div>

      <div className="filter-grid">
        <div className="field">
          <label htmlFor="crowding">Crowding status</label>
          <select id="crowding" className="select" value={filters.crowding} onChange={(e) => updateField("crowding", e.target.value as DashboardFilters["crowding"])}>
            {options.crowding.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>

        <div className="field">
          <label htmlFor="priority">Priority</label>
          <select id="priority" className="select" value={filters.priority} onChange={(e) => updateField("priority", e.target.value as DashboardFilters["priority"])}>
            {options.priority.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>

        <div className="field">
          <label htmlFor="hour">Waktu (jam)</label>
          <select id="hour" className="select" value={filters.hour} onChange={(e) => updateField("hour", e.target.value)}>
            {options.hours.map((hour) => <option key={hour} value={hour}>{hour}</option>)}
          </select>
        </div>

        <div className="field">
          <label htmlFor="day">Waktu (hari)</label>
          <select id="day" className="select" value={filters.day} onChange={(e) => updateField("day", e.target.value)}>
            {options.days.map((day) => <option key={day} value={day}>{day}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
