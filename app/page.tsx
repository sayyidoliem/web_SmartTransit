import DashboardShell from "@/components/dashboard-shell";
import { getDashboardState } from "@/lib/mock-data";

export default async function HomePage() {
  const data = await getDashboardState();
  return <DashboardShell data={data} />;
}
