import DeveloperShell from "@/components/developer-shell";
import { createInitialDashboardState } from "@/lib/mock-data";

export default function DeveloperPage() {
  return <DeveloperShell initialData={createInitialDashboardState()} />;
}
