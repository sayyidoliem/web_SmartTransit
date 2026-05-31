import { NextRequest, NextResponse } from "next/server";

const ML_SERVICE_URL =
  process.env.ML_SERVICE_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const response = await fetch(`${ML_SERVICE_URL}/allocation/predict`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Failed to run allocation prediction",
          detail: data?.detail ?? data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal allocation API error",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}