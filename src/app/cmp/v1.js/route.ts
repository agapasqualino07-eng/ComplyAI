import { NextResponse } from "next/server";

export const runtime = "edge";

const SCRIPT = `(function(){
  var script = document.currentScript;
  var siteId = script && script.getAttribute('data-site');
  if (!siteId) { console.warn('[ComplyAI] data-site mancante'); return; }
  var apiBase = new URL(script.src).origin;

  var STORAGE_KEY = 'complyai_consent_' + siteId;
  function getStored() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (parsed && parsed.exp && parsed.exp < Date.now()) return null;
      return parsed;
    } catch (e) { return null; }
  }
  function setStored(consent) {
    var data = { c: consent, ts: Date.now(), exp: Date.now() + 1000*60*60*24*180 };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
    return data;
  }

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){
      var r = Math.random()*16|0, v = c==='x'?r:(r&0x3|0x8); return v.toString(16);
    });
  }
  var subjectId = (function(){
    var k = 'complyai_subject';
    try {
      var v = localStorage.getItem(k);
      if (!v) { v = uuid(); localStorage.setItem(k, v); }
      return v;
    } catch (e) { return uuid(); }
  })();

  function logConsent(categories) {
    var consentString = Object.keys(categories).filter(function(k){ return categories[k]; }).join(',');
    fetch(apiBase + '/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        site_id: siteId,
        subject_id: subjectId,
        categories: categories,
        consent_string: consentString,
        page_url: location.href,
        user_agent: navigator.userAgent
      })
    }).catch(function(){});
  }

  function loadConfig() {
    return fetch(apiBase + '/api/cmp/config/' + siteId, { credentials: 'omit' })
      .then(function(r){ return r.ok ? r.json() : null; });
  }

  function html(strings){ return strings.raw[0]; }

  function injectStyles(accent) {
    if (document.getElementById('complyai-style')) return;
    var s = document.createElement('style');
    s.id = 'complyai-style';
    s.textContent = ''
      + '.complyai-overlay{position:fixed;z-index:2147483646;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0f0f12;}'
      + '.complyai-overlay.dark{color:#fafafa;}'
      + '.complyai-card{background:#fff;border:1px solid #e4e4e7;box-shadow:0 10px 40px rgba(0,0,0,.18);border-radius:14px;padding:18px;max-width:100%;}'
      + '.complyai-overlay.dark .complyai-card{background:#0f0f12;border-color:#27272a;}'
      + '.complyai-row{display:flex;flex-direction:column;gap:12px;}'
      + '@media(min-width:640px){.complyai-row.bar{flex-direction:row;align-items:center;}}'
      + '.complyai-text{flex:1;min-width:0;font-size:13px;line-height:1.5;}'
      + '.complyai-title{font-weight:600;font-size:14px;margin:0 0 4px;}'
      + '.complyai-actions{display:flex;flex-wrap:wrap;gap:8px;}'
      + '.complyai-btn{cursor:pointer;font-size:12px;font-weight:500;padding:8px 14px;border-radius:8px;border:1px solid #d4d4d8;background:transparent;color:inherit;}'
      + '.complyai-overlay.dark .complyai-btn{border-color:#52525b;}'
      + '.complyai-btn-primary{background:' + accent + ';color:#fff;border-color:transparent;}'
      + '.complyai-pos-bottom{bottom:16px;left:16px;right:16px;}'
      + '.complyai-pos-top{top:16px;left:16px;right:16px;}'
      + '.complyai-pos-center{top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.4);}'
      + '.complyai-pos-center .complyai-card{max-width:480px;width:calc(100% - 32px);}'
      + '.complyai-cats{margin-top:12px;display:grid;gap:8px;border-top:1px solid #e4e4e7;padding-top:12px;}'
      + '.complyai-overlay.dark .complyai-cats{border-color:#27272a;}'
      + '.complyai-cat{display:flex;justify-content:space-between;align-items:center;font-size:12px;}'
      + '.complyai-cat label{display:flex;align-items:center;gap:8px;cursor:pointer;}'
      + '.complyai-trigger{position:fixed;bottom:16px;left:16px;width:36px;height:36px;border-radius:999px;background:' + accent + ';color:#fff;border:none;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.2);font-size:18px;z-index:2147483645;}'
      + '.complyai-hide{display:none !important;}';
    document.head.appendChild(s);
  }

  function render(cfg) {
    var t = cfg.texts || {};
    var cats = cfg.categories || [];
    var accent = cfg.accent_color || '#6d28d9';
    injectStyles(accent);

    var overlay = document.createElement('div');
    overlay.id = 'complyai-cmp';
    overlay.className = 'complyai-overlay complyai-pos-' + (cfg.position || 'bottom') + (cfg.theme === 'dark' ? ' dark' : '');

    var card = document.createElement('div');
    card.className = 'complyai-card';
    var row = document.createElement('div');
    row.className = 'complyai-row ' + (cfg.layout === 'bar' ? 'bar' : 'box');

    var text = document.createElement('div');
    text.className = 'complyai-text';
    text.innerHTML = '<p class="complyai-title">' + escapeHtml(t.title || 'Rispettiamo la tua privacy') + '</p>'
      + '<div>' + escapeHtml(t.body || 'Usiamo cookie per offrirti la migliore esperienza.') + '</div>';

    var actions = document.createElement('div');
    actions.className = 'complyai-actions';

    var btnReject = document.createElement('button'); btnReject.className = 'complyai-btn'; btnReject.textContent = t.reject || 'Rifiuta';
    var btnCustom = document.createElement('button'); btnCustom.className = 'complyai-btn'; btnCustom.textContent = t.customize || 'Personalizza';
    var btnAccept = document.createElement('button'); btnAccept.className = 'complyai-btn complyai-btn-primary'; btnAccept.textContent = t.accept || 'Accetta tutti';

    actions.appendChild(btnReject); actions.appendChild(btnCustom); actions.appendChild(btnAccept);
    row.appendChild(text); row.appendChild(actions);
    card.appendChild(row);

    var catsBox = document.createElement('div');
    catsBox.className = 'complyai-cats complyai-hide';
    cats.forEach(function(c){
      var line = document.createElement('div');
      line.className = 'complyai-cat';
      var label = document.createElement('label');
      var input = document.createElement('input');
      input.type = 'checkbox';
      input.dataset.cat = c.id;
      input.checked = !!c.required;
      input.disabled = !!c.required;
      label.appendChild(input);
      var span = document.createElement('span'); span.textContent = c.label; label.appendChild(span);
      var meta = document.createElement('span'); meta.textContent = c.required ? 'Sempre attivo' : '';
      meta.style.opacity = '.6';
      line.appendChild(label); line.appendChild(meta);
      catsBox.appendChild(line);
    });
    var btnSave = document.createElement('button'); btnSave.className = 'complyai-btn complyai-btn-primary complyai-hide'; btnSave.textContent = t.save || 'Salva preferenze';
    catsBox.appendChild(btnSave);
    card.appendChild(catsBox);

    if ((cfg.position || 'bottom') === 'center') {
      overlay.appendChild(card);
    } else {
      overlay.appendChild(card);
    }
    document.body.appendChild(overlay);

    function close(){ overlay.remove(); ensureTrigger(cfg); }

    function acceptAll(){
      var c = {}; cats.forEach(function(x){ c[x.id] = true; });
      setStored(c); logConsent(c); close(); window.dispatchEvent(new CustomEvent('complyai:consent',{detail:c}));
    }
    function rejectAll(){
      var c = {}; cats.forEach(function(x){ c[x.id] = !!x.required; });
      setStored(c); logConsent(c); close(); window.dispatchEvent(new CustomEvent('complyai:consent',{detail:c}));
    }
    function saveCustom(){
      var c = {};
      cats.forEach(function(x){
        var input = catsBox.querySelector('input[data-cat="' + x.id + '"]');
        c[x.id] = input ? !!input.checked : !!x.required;
      });
      setStored(c); logConsent(c); close(); window.dispatchEvent(new CustomEvent('complyai:consent',{detail:c}));
    }

    btnAccept.addEventListener('click', acceptAll);
    btnReject.addEventListener('click', rejectAll);
    btnSave.addEventListener('click', saveCustom);
    btnCustom.addEventListener('click', function(){
      catsBox.classList.remove('complyai-hide');
      btnSave.classList.remove('complyai-hide');
    });
  }

  function ensureTrigger(cfg) {
    if (document.getElementById('complyai-trigger')) return;
    var b = document.createElement('button');
    b.id = 'complyai-trigger';
    b.className = 'complyai-trigger';
    b.title = 'Gestisci preferenze cookie';
    b.textContent = '🍪';
    b.addEventListener('click', function(){ b.remove(); render(cfg); });
    document.body.appendChild(b);
  }

  function escapeHtml(str){
    return String(str || '').replace(/[&<>"']/g, function(s){
      return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[s];
    });
  }

  loadConfig().then(function(cfg){
    if (!cfg) return;
    var stored = getStored();
    if (stored && (cfg.consent_mode === 'opt_in' || cfg.consent_mode === 'opt_out')) {
      ensureTrigger(cfg);
      window.complyaiConsent = stored.c;
      window.dispatchEvent(new CustomEvent('complyai:consent',{detail:stored.c}));
      return;
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function(){ render(cfg); });
    } else {
      render(cfg);
    }
  });

  window.complyaiOpenSettings = function(){
    var existing = document.getElementById('complyai-cmp');
    if (existing) return;
    loadConfig().then(function(cfg){ if (cfg) render(cfg); });
  };
})();`;

export async function GET() {
  return new NextResponse(SCRIPT, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
