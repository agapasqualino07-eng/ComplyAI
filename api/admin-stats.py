"""
AIComply — Admin Stats v2.1 (FIXED)
FIX: Count parsing, error handling, timeout
"""
import json, os
from http.server import BaseHTTPRequestHandler
from urllib.request import Request, urlopen
from urllib.error import HTTPError

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1a3R4YnFqZW1pemFmaXp4aHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2OTAyMzYsImV4cCI6MjA5MDI2NjIzNn0.3aNOEbNNCWpJgWMmQHPkOG4KeSdkndVsHy9tch5p78Q"
ADMIN_EMAILS = ["agapro@gmail.com", "agaenterprise@gmail.com"]

def _sb_get(table, q=""):
    url = f"{SUPABASE_URL}/rest/v1/{table}{q}"
    h = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}", "Prefer": "count=exact"}
    try:
        with urlopen(Request(url, headers=h, method="GET"), timeout=10) as r:
            data = json.loads(r.read().decode())
            cr = r.headers.get("content-range", "")
            total = len(data)
            if cr and "/" in cr:
                try: total = int(cr.split("/")[1])
                except (ValueError, IndexError): pass
            return data, total
    except Exception as e:
        print(f"[ADMIN ERR] {table}: {e}")
        return [], 0

def _verify_admin(auth):
    if not auth or not auth.startswith("Bearer "): return False, None
    try:
        r = Request(f"{SUPABASE_URL}/auth/v1/user",
            headers={"apikey": ANON_KEY, "Authorization": auth}, method="GET")
        with urlopen(r, timeout=8) as resp:
            u = json.loads(resp.read().decode())
            email = u.get("email", "").lower().strip()
            return email in ADMIN_EMAILS, email
    except Exception: return False, None

class handler(BaseHTTPRequestHandler):
    def log_message(self, *a): pass

    def _json(self, status, data):
        self.send_response(status)
        for k, v in [("Content-Type","application/json"),
            ("Access-Control-Allow-Origin","https://aicomplyonline.it"),
            ("Access-Control-Allow-Methods","GET, OPTIONS"),
            ("Access-Control-Allow-Headers","Content-Type, Authorization"),
            ("Cache-Control","no-store")]:
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def do_OPTIONS(self): self._json(200, {"ok": True})

    def do_GET(self):
        ok, email = _verify_admin(self.headers.get("Authorization", ""))
        if not ok:
            self._json(403, {"error": "Non autorizzato"})
            return

        stats = {}
        # Quiz
        qd, qt = _sb_get("quiz_completions", "?select=sector,score,tools_selected,clicked_pro,completed_at&order=completed_at.desc&limit=500")
        scores = [q.get("score", 0) for q in qd]
        convs = sum(1 for q in qd if q.get("clicked_pro"))
        by_sector = {}
        for q in qd:
            s = q.get("sector", "?")
            by_sector[s] = by_sector.get(s, 0) + 1
        stats["quiz"] = {"total": qt, "avg_score": round(sum(scores)/max(len(scores),1), 1),
            "conversions": convs, "rate": round(convs/max(len(qd),1)*100, 1), "by_sector": by_sector}

        # Subs
        sd, st2 = _sb_get("subscriptions", "?select=plan,status,customer_email,created_at&order=created_at.desc")
        ap = sum(1 for s in sd if s.get("plan")=="pro" and s.get("status") in ("active","canceling"))
        ae = sum(1 for s in sd if s.get("plan")=="enterprise" and s.get("status") in ("active","canceling"))
        stats["subs"] = {"total": st2, "pro": ap, "enterprise": ae, "mrr": ap*29 + ae*199}

        # Users
        _, up = _sb_get("profiles", "?select=id")
        _, uc = _sb_get("companies", "?select=id")
        _, upt = _sb_get("partners", "?select=id")
        stats["users"] = {"profiles": up, "companies": uc, "partners": upt}

        # Systems
        sysd, syst = _sb_get("ai_systems", "?select=name,category,vendor_key&limit=1000")
        by_cat, by_vendor = {}, {}
        for s in sysd:
            c = s.get("category", "?")
            by_cat[c] = by_cat.get(c, 0) + 1
            v = s.get("vendor_key") or s.get("name", "?")
            by_vendor[v] = by_vendor.get(v, 0) + 1
        stats["systems"] = {"total": syst, "by_category": by_cat,
            "top_vendors": dict(sorted(by_vendor.items(), key=lambda x: x[1], reverse=True)[:10])}

        self._json(200, stats)
