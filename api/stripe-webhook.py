"""
AIComply — Stripe Webhook v2.1 (FIXED)
FIX: URL encoding, rate limiting, replay protection, error handling
"""
import json, os, hmac, hashlib, time
from http.server import BaseHTTPRequestHandler
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from urllib.parse import quote

STRIPE_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

_rate = {}

def _rl(ip):
    now = time.time()
    _rate[ip] = [t for t in _rate.get(ip, []) if now - t < 60]
    if len(_rate[ip]) >= 60:
        return False
    _rate[ip].append(now)
    return True

def _sb(method, table, data=None, q=""):
    url = f"{SUPABASE_URL}/rest/v1/{table}{q}"
    h = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}",
         "Content-Type": "application/json", "Prefer": "return=representation"}
    body = json.dumps(data).encode() if data else None
    try:
        with urlopen(Request(url, data=body, headers=h, method=method), timeout=10) as r:
            raw = r.read().decode()
            return json.loads(raw) if raw else []
    except HTTPError as e:
        print(f"[SB ERR] {method} {table}: {e.code}")
        return None
    except Exception as e:
        print(f"[SB EXC] {e}")
        return None

def _verify_sig(payload, sig_header, secret):
    if not sig_header or not secret:
        return False
    try:
        parts = {}
        for item in sig_header.split(","):
            if "=" in item:
                k, v = item.split("=", 1)
                parts[k.strip()] = v.strip()
        ts, sig = parts.get("t", ""), parts.get("v1", "")
        if not ts or not sig:
            return False
        if abs(time.time() - int(ts)) > 300:
            return False
        expected = hmac.new(secret.encode(), f"{ts}.{payload}".encode(), hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, sig)
    except Exception:
        return False

class handler(BaseHTTPRequestHandler):
    def log_message(self, *a): pass

    def _json(self, status, data):
        self.send_response(status)
        for k, v in [("Content-Type","application/json"),("Access-Control-Allow-Origin","*"),
            ("Access-Control-Allow-Methods","POST, OPTIONS"),
            ("Access-Control-Allow-Headers","Content-Type, stripe-signature")]:
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def do_OPTIONS(self): self._json(200, {"ok": True})
    def do_GET(self): self._json(200, {"service": "aicomply-webhook", "method": "POST"})

    def do_POST(self):
        if not all([STRIPE_SECRET, SUPABASE_URL, SUPABASE_KEY]):
            self._json(500, {"error": "Config missing"})
            return
        ip = self.headers.get("X-Forwarded-For", "0")
        if not _rl(ip):
            self._json(429, {"error": "Rate limited"})
            return
        cl = int(self.headers.get("Content-Length", 0))
        if cl < 1 or cl > 1_000_000:
            self._json(400, {"error": "Bad body"})
            return
        raw = self.rfile.read(cl).decode()
        if not _verify_sig(raw, self.headers.get("stripe-signature", ""), STRIPE_SECRET):
            self._json(401, {"error": "Bad signature"})
            return
        try:
            event = json.loads(raw)
        except Exception:
            self._json(400, {"error": "Bad JSON"})
            return

        t = event.get("type", "")
        d = event.get("data", {}).get("object", {})
        print(f"[EVT] {t}")

        try:
            if t == "checkout.session.completed": self._checkout(d)
            elif t == "customer.subscription.updated": self._sub_upd(d)
            elif t == "customer.subscription.deleted": self._sub_del(d)
            elif t == "invoice.payment_failed": self._pay_fail(d)
        except Exception as e:
            print(f"[ERR] {t}: {e}")

        self._json(200, {"received": True})

    def _checkout(self, s):
        email = (s.get("customer_details", {}).get("email") or s.get("customer_email") or "").strip().lower()
        if not email: return
        cid = s.get("customer", "")
        sid = s.get("subscription", "") or f"chk_{s.get('id','')[:24]}"
        plan = "enterprise" if (s.get("amount_total") or 0) >= 15000 else "pro"
        # FIX: URL-encode email
        eq = quote(email, safe="")
        existing = _sb("GET", "subscriptions", q=f"?customer_email=eq.{eq}&plan=eq.{plan}&select=id")
        row = {"customer_email": email, "stripe_customer_id": cid,
               "stripe_subscription_id": sid, "plan": plan, "status": "active", "updated_at": "now()"}
        if existing and len(existing) > 0:
            _sb("PATCH", "subscriptions", row, q=f"?id=eq.{existing[0]['id']}")
        else:
            _sb("POST", "subscriptions", row)
        print(f"[OK] {email} -> {plan}")

    def _sub_upd(self, sub):
        sid = sub.get("id", "")
        st = sub.get("status", "")
        cancel = sub.get("cancel_at_period_end", False)
        our = "canceling" if cancel else ("active" if st in ("active","trialing") else st)
        upd = {"status": our, "updated_at": "now()"}
        pe = sub.get("current_period_end")
        if pe:
            from datetime import datetime, timezone
            upd["current_period_end"] = datetime.fromtimestamp(pe, tz=timezone.utc).isoformat()
        _sb("PATCH", "subscriptions", upd, q=f"?stripe_subscription_id=eq.{quote(sid, safe='')}")

    def _sub_del(self, sub):
        sid = sub.get("id", "")
        _sb("PATCH", "subscriptions", {"status": "canceled", "updated_at": "now()"},
            q=f"?stripe_subscription_id=eq.{quote(sid, safe='')}")

    def _pay_fail(self, inv):
        sid = inv.get("subscription", "")
        if sid:
            _sb("PATCH", "subscriptions", {"status": "past_due", "updated_at": "now()"},
                q=f"?stripe_subscription_id=eq.{quote(sid, safe='')}")
