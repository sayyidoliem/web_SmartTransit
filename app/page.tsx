import DashboardShell from "@/components/dashboard-shell";
import { createInitialDashboardState } from "@/lib/mock-data";

export default function HomePage() {
  const initialData = createInitialDashboardState();
  return <DashboardShell initialData={initialData} />;
}
