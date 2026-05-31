import { NextResponse } from "next/server";
import { getCurrentDensity } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(await getCurrentDensity());
}
