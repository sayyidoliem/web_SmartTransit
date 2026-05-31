import CorridorDetailShell from "@/components/corridor-detail-shell";
import { createInitialDashboardState } from "@/lib/mock-data";

export default async function CorridorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CorridorDetailShell corridorId={id} initialData={createInitialDashboardState()} />;
}
