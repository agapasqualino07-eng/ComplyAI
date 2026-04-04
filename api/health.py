"""
AIComply — Health Check v2.1
"""
import json, os
from http.server import BaseHTTPRequestHandler
from urllib.request import Request, urlopen

class handler(BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def _json(self, status, data):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def do_GET(self):
        checks = {"api": True}
        envs = ["STRIPE_SECRET_KEY","STRIPE_WEBHOOK_SECRET","SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY"]
        for e in envs:
            checks[f"env_{e.lower()}"] = bool(os.environ.get(e))
        sb_url = os.environ.get("SUPABASE_URL", "")
        sb_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
        checks["supabase"] = False
        if sb_url and sb_key:
            try:
                r = Request(f"{sb_url}/rest/v1/alerts?select=id&limit=1",
                    headers={"apikey": sb_key, "Authorization": f"Bearer {sb_key}"})
                with urlopen(r, timeout=5) as resp:
                    checks["supabase"] = resp.status == 200
            except Exception: pass
        ok = all(checks.values())
        self._json(200 if ok else 503, {"status": "healthy" if ok else "degraded", "checks": checks, "version": "2.1.0"})
