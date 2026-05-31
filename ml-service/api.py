from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os
import torch

import inference

app = FastAPI(title="SmartTransit ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sesuaikan path artifacts dengan struktur folder kamu
inference.ARTIFACTS_DIR = inference.Path(
    "./training_and_inferences/model_allocation"
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "smarttransit-ml-service"
    }


@app.post("/allocation/predict")
async def predict_allocation(
    file: UploadFile = File(...),
    bus_type: str = Form(...)
):
    if bus_type not in ["big", "small"]:
        raise HTTPException(
            status_code=400,
            detail="bus_type must be either 'big' or 'small'"
        )

    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Only CSV file is supported"
        )

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as tmp:
            content = await file.read()
            tmp.write(content)
            csv_path = tmp.name

        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        df = inference.run_pipeline(
            csv_path=csv_path,
            bus_type=bus_type,
            target_date=None,
            device=device,
        )

        result = (
            df[
                [
                    "corridorID",
                    "hour",
                    "alokasi_hari_ini",
                    "overload_prob",
                    "overload_pred",
                ]
            ]
            .sort_values(["corridorID", "hour"])
            .reset_index(drop=True)
        )

        return {
            "bus_type": bus_type,
            "total_rows": len(result),
            "data": result.to_dict(orient="records"),
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if "csv_path" in locals() and os.path.exists(csv_path):
            os.remove(csv_path)
