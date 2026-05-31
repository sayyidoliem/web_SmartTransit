"use client";
import { useEffect, useState } from "react";
import type { DashboardFilters, GpsSnapshot } from "@/lib/types";
export function useGpsStream(
  filters: DashboardFilters,
  initialSnapshot: GpsSnapshot,
) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [status, setStatus] = useState<"connecting" | "live" | "error">(
    "connecting",
  );
  useEffect(() => {
    setSnapshot(initialSnapshot);
  }, [initialSnapshot]);
  useEffect(() => {
    const params = new URLSearchParams({
      corridorId: filters.corridorId,
      date: filters.date,
      day: filters.day,
      hour: filters.hour,
      crowding: filters.crowding,
      priority: filters.priority,
    });
    setStatus("connecting");
    const source = new EventSource(`/api/gps/stream?${params.toString()}`);
    source.addEventListener("gps", (event) => {
      try {
        const next = JSON.parse((event as MessageEvent).data) as GpsSnapshot;
        setSnapshot(next);
        setStatus("live");
      } catch {
        setStatus("error");
      }
    });
    source.onerror = () => {
      setStatus("error");
      source.close();
    };
    return () => source.close();
  }, [
    filters.corridorId,
    filters.date,
    filters.day,
    filters.hour,
    filters.crowding,
    filters.priority,
  ]);
  return { snapshot, status };
}
