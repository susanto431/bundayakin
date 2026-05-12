import os
from typing import Annotated

from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException
from fastapi.responses import Response

from services.nanny_profile import generate_nanny_report, ReportRequest

load_dotenv()

PDF_SERVICE_SECRET = os.getenv("PDF_SERVICE_SECRET", "")

app = FastAPI(title="BundaYakin PDF Service", version="1.0.0")


def _verify_key(x_api_key: str) -> None:
    if not PDF_SERVICE_SECRET or x_api_key != PDF_SERVICE_SECRET:
        raise HTTPException(status_code=401, detail="Invalid API key")


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "bundayakin-pdf"}


@app.post("/generate-report")
def generate_report(
    body: ReportRequest,
    x_api_key: Annotated[str, Header()] = "",
) -> Response:
    _verify_key(x_api_key)

    pdf_bytes = generate_nanny_report(body)

    filename = f"laporan-kecocokan-{body.matching_request_id[:8]}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
