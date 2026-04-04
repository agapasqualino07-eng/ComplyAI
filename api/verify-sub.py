"""
AIComply — Verifica Subscription v2.1 (FIXED)
FIX: Rimosso codice morto, URL parsing sicuro, CORS restrittivo
"""
import json, os
from http.server import BaseHTTPRequestHandler
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from urllib.parse import urlparse, parse_qs, quote

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
ANON_KEY = os.environ.get("SUPABASE_ANON_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1a3R4YnFqZW1pemFmaXp4aHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2OTAyMzYsImV4cCI6MjA5MDI2NjIzNn0.3aNOEbNNCWpJgWMmQHPkOG4KeSdkndVsHy9tch5p78Q")

ALLOWED = ["https://aicomplyonline.it", "https://www.aicomplyonline.it", "http://localhost:3000"]

def _cors(origin):
    return origin if origin in ALLOWED else ALLOWED[0]

def _get_user(token):
    """Verifica JWT con Supabase Auth API."""
    try:
        r = Request(f"{SUPABASE_URL}/auth/v1/user",
            headers={"apikey": ANON_KEY, "Authorization": f"Bearer {token}"}, method="GET")
        with urlopen(r, timeout=8) as resp:
            return json.loads(resp.read().decode())
    except Exception:
        return None

def _check_sub(email, plan=None):
    """Cerca subscription attiva per email."""
    eq = quote(email.lower().strip(), safe="")
    q = f"?customer_email=eq.{eq}&status=in.(active,canceling)&select=*"
    if plan:
        q += f"&plan=eq.{plan}"
    try:
        r = Request(f"{SUPABASE_URL}/rest/v1/subscriptions{q}",
            headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}, method="GET")
        with urlopen(r, timeout=8) as resp:
            data = json.loads(resp.read().decode())
            return data[0] if data else None
    except Exception:
        return None

class handler(BaseHTTPRequestHandler):
    def log_message(self, *a): pass

    def _json(self, status, data, origin="*"):
        self.send_response(status)
        for k, v in [("Content-Type","application/json"),("Access-Control-Allow-Origin",origin),
            ("Access-Control-Allow-Methods","GET, OPTIONS"),("Access-Control-Allow-Headers","Content-Type, Authorization"),
            ("Cache-Control","no-store, no-cache")]:
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def do_OPTIONS(self):
        self._json(200, {"ok": True}, _cors(self.headers.get("Origin", "")))

    def do_GET(self):
        origin = _cors(self.headers.get("Origin", ""))
        auth = self.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            self._json(401, {"error": "Token mancante", "active": False}, origin)
            return

        user = _get_user(auth.replace("Bearer ", "").strip())
        if not user or not user.get("email"):
            self._json(401, {"error": "Token non valido", "active": False}, origin)
            return

        email = user["email"].lower().strip()

        # FIX: parsing URL sicuro con urllib
        plan = None
        try:
            parsed = urlparse(self.path)
            params = parse_qs(parsed.query)
            plan = params.get("plan", [None])[0]
        except Exception:
            pass

        sub = _check_sub(email, plan)
        if sub:
            self._json(200, {"active": True, "plan": sub.get("plan",""), "status": sub.get("status",""),
                "email": email, "current_period_end": sub.get("current_period_end")}, origin)
        else:
            self._json(200, {"active": False, "email": email,
                "message": "Nessun abbonamento attivo"}, origin)
