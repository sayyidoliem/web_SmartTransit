import MonitoringShell from "@/components/monitoring-shell";
import { createInitialDashboardState } from "@/lib/mock-data";

export default function MonitoringPage() {
  return <MonitoringShell initialData={createInitialDashboardState()} />;
}
