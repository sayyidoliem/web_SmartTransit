import { NextResponse } from "next/server";
import { getDashboardState } from "@/lib/mock-data";

export async function GET() {
  const data = await getDashboardState();
  return NextResponse.json(data);
}
