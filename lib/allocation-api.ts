import type { AllocationPredictionResponse, BusType } from "./types";

export async function predictBusAllocation(params: {
  file: File;
  busType: BusType;
}): Promise<AllocationPredictionResponse> {
  const formData = new FormData();

  formData.append("file", params.file);
  formData.append("bus_type", params.busType);

  const response = await fetch("/api/allocation/predict", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.detail || data?.error || "Failed to predict bus allocation",
    );
  }

  return data;
}
