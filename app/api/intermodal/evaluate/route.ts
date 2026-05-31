import { NextRequest, NextResponse } from "next/server";
import { evaluateTransferWindow } from "@/lib/predict";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = evaluateTransferWindow({
    feederEtaMinutes: Number(body.feederEtaMinutes),
    trainDepartureInMinutes: Number(body.trainDepartureInMinutes),
    transferBufferMinutes: Number(body.transferBufferMinutes ?? 10)
  });

  return NextResponse.json(result);
}
