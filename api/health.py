import json
import os
from urllib.request import Request, urlopen


def handler(request):

    checks = {"api": True}

    envs = [
        "STRIPE_SECRET_KEY",
        "STRIPE_WEBHOOK_SECRET",
        "SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY",
    ]

    for e in envs:
        checks[f"env_{e.lower()}"] = bool(os.environ.get(e))

    # Supabase check
    sb_url = os.environ.get("SUPABASE_URL", "")
    sb_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    checks["supabase"] = False

    if sb_url and sb_key:
        try:
            r = Request(
                f"{sb_url}/rest/v1/alerts?select=id&limit=1",
                headers={
                    "apikey": sb_key,
                    "Authorization": f"Bearer {sb_key}",
                },
            )
            with urlopen(r, timeout=5) as resp:
                checks["supabase"] = resp.status == 200
        except Exception:
            pass

    ok = all(checks.values())

    body = {
        "status": "healthy" if ok else "degraded",
        "checks": checks,
        "version": "2.1.0",
    }

    return {
        "statusCode": 200 if ok else 503,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        "body": json.dumps(body),
    }
