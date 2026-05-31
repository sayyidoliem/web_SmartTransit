import DashboardShell from "@/components/dashboard-shell";
import { createInitialDashboardState } from "@/lib/mock-data";

export default function HomePage() {
  return <DashboardShell initialData={createInitialDashboardState()} />;
}
