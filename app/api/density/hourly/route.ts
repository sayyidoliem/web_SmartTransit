import { NextResponse } from "next/server";
import { getHourlyDensity } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(await getHourlyDensity());
}
