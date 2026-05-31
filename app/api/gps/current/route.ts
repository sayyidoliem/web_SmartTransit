import { NextRequest, NextResponse } from "next/server";
import { getRealtimeGpsSnapshot } from "@/lib/mock-data";
import type { CrowdingFilter, PriorityFilter } from "@/lib/types";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;
  const snapshot = getRealtimeGpsSnapshot({
    day: search.get("day") ?? undefined,
    hour: search.get("hour") ?? undefined,
    crowding: (search.get("crowding") as CrowdingFilter | null) ?? undefined,
    priority: (search.get("priority") as PriorityFilter | null) ?? undefined
  });

  return NextResponse.json(snapshot);
}
