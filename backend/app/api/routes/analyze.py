from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.api.deps import get_client_ip, get_youtube_cookies_base64
from app.models.analyze import AnalyzeRequest, AnalyzeResponse
from app.services.youtube import analyze_url
from app.services.ytdlp_config import is_bot_check_error

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/analyze", response_model=AnalyzeResponse)
@limiter.limit("10/minute")
async def analyze(request: Request, body: AnalyzeRequest) -> AnalyzeResponse:
    _ = get_client_ip(request)
    cookies_base64 = get_youtube_cookies_base64(request)
    try:
        return analyze_url(body.url, cookies_base64=cookies_base64)
    except Exception as exc:
        detail = str(exc)
        if is_bot_check_error(detail):
            detail = (
                "YouTube blocked this request (bot check). "
                "Add YouTube cookies in TuneFetch Settings, or set YOUTUBE_COOKIES_BASE64 on Railway."
            )
        raise HTTPException(status_code=400, detail=detail) from exc
