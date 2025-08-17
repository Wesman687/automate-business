# utils/cookies.py
from typing import Dict
from fastapi import Request

PROD_COOKIE_DOMAIN = ".stream-lineai.com"  # change if needed
AUTH_COOKIE_NAME = "auth_token"

def _effective_host(request: Request) -> str:
    # behind proxies, prefer X-Forwarded-Host/Host
    return (request.headers.get("x-forwarded-host")
            or request.headers.get("host")
            or (request.url.hostname or "")).split(":")[0].lower()

def _is_local(host: str) -> bool:
    return host in {"localhost", "127.0.0.1", "::1"} or host.endswith(".local")

def build_auth_cookie_kwargs(request: Request) -> Dict:
    """
    Returns kwargs for Response.set_cookie that work in dev & prod.
    Dev (localhost): SameSite=Lax, Secure=False, NO domain.
    Prod (*.stream-lineai.com): SameSite=None, Secure=True, domain=.stream-lineai.com
    """
    host = _effective_host(request)
    base = dict(max_age=60*60*24, httponly=True, path="/")  # 24h

    if _is_local(host):
        base.update(secure=False, samesite="lax")
    else:
        base.update(secure=True, samesite="none", domain=PROD_COOKIE_DOMAIN)

    return base
