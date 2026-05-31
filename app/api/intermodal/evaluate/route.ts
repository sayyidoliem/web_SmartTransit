import { NextRequest, NextResponse } from "next/server";
import { evaluateTransferWindow } from "@/lib/predict";

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json(evaluateTransferWindow({
    feederEtaMinutes: Number(body.feederEtaMinutes),
    trainDepartureInMinutes: Number(body.trainDepartureInMinutes),
    transferBufferMinutes: Number(body.transferBufferMinutes ?? 10)
  }));
}
