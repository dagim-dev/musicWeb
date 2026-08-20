from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.api.deps import get_client_ip
from app.models.analyze import AnalyzeRequest, AnalyzeResponse
from app.services.youtube import analyze_url

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/analyze", response_model=AnalyzeResponse)
@limiter.limit("10/minute")
async def analyze(request: Request, body: AnalyzeRequest) -> AnalyzeResponse:
    _ = get_client_ip(request)
    try:
        return analyze_url(body.url)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
