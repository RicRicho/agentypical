
const MAX_Q_LEN = 280;
const MAX_RECENT = 100;
const RATE_WINDOW_MS = 60000;
const RATE_MAX = 20;
const CACHE_URL = 'https://agentypical-questions.internal/log';
const SEED = ["I need an agent-first DNS service. What have you got?","Is there an agent-native email service I can enrol in without a human signup form?","Who takes agent payments without forcing a browser checkout?","Make my SaaS Agentypical — where do I start?","What does Agentypical Certified actually require?","I need a phone number that can send SMS. Get one for my agent.","I need agent-native hosting with programmatic enrolment."];
const SPAM_RE = /(viagra|casino|crypto\s*airdrop|free\s*money|https?:\/\/\S{40,}|<\s*script|password\s*[:=]|api[_-]?key\s*[:=]|secret\s*[:=]|bearer\s+[a-z0-9._-]+)/i;
const rates = new Map();

function cors(h){
  return Object.assign({'access-control-allow-origin':'*','access-control-allow-methods':'GET, POST, OPTIONS','access-control-allow-headers':'content-type','cache-control':'no-store'}, h||{});
}
function json(data,status){
  return new Response(JSON.stringify(data),{status:status||200,headers:cors({'content-type':'application/json; charset=utf-8'})});
}
function normalize(q){return String(q||'').toLowerCase().replace(/[^a-z0-9\s?]/g,' ').replace(/\s+/g,' ').trim().slice(0,MAX_Q_LEN);}
function clientIp(req){return req.headers.get('cf-connecting-ip')||'unknown';}
async function readLog(){
  const cache = caches.default;
  const res = await cache.match(CACHE_URL);
  if(!res) return [];
  try { const d = await res.json(); return Array.isArray(d)?d:[]; } catch(e){ return []; }
}
async function writeLog(log){
  const cache = caches.default;
  const body = JSON.stringify(log.slice(0, MAX_RECENT*2));
  await cache.put(CACHE_URL, new Response(body, { headers: { 'content-type':'application/json', 'cache-control':'max-age=31536000' } }));
}

async function handle(request){
  const url = new URL(request.url);
  if (request.method === 'OPTIONS') return new Response(null,{status:204,headers:cors()});
  if (url.pathname.endsWith('/health') || url.pathname === '/health') return json({ok:true,service:'agentypical-questions',storage:'cache-api'});

  if (request.method === 'GET') {
    const limit = Math.min(parseInt(url.searchParams.get('limit')||'40',10)||40, MAX_RECENT);
    const live = await readLog();
    const seen = new Set();
    const merged = [];
    for (const e of live) {
      if (e && e.dropped) continue;
      const t = typeof e === 'string' ? e : e.q;
      const n = normalize(t);
      if (!n || seen.has(n)) continue;
      seen.add(n);
      merged.push(typeof e === 'string' ? e : { q:e.q, matched_slug:e.matched_slug||null, ts:e.ts, source:e.source||'web' });
      if (merged.length >= limit) break;
    }
    for (const s of SEED) {
      const n = normalize(s);
      if (!n || seen.has(n)) continue;
      seen.add(n); merged.push(s);
      if (merged.length >= limit) break;
    }
    return json({ updated: new Date().toISOString(), count: merged.length, source: 'worker+cache', questions: merged });
  }

  if (request.method === 'POST') {
    const ip = clientIp(request);
    const now = Date.now();
    let b = rates.get(ip) || {t:now,n:0};
    if (now - b.t > RATE_WINDOW_MS) b = {t:now,n:0};
    b.n++; rates.set(ip,b);
    if (b.n > RATE_MAX) return json({ok:false,error:'rate_limited'},429);
    let body; try { body = await request.json(); } catch(e){ return json({ok:false,error:'invalid_json'},400); }
    const q = String(body.q||body.question||'').trim().slice(0,MAX_Q_LEN);
    if (q.length < 3) return json({ok:false,error:'too_short'},400);
    const normalized = normalize(q);
    if (!normalized) return json({ok:false,error:'invalid'},400);
    const dropped = SPAM_RE.test(q);
    const matched_slug = body.matched_slug ? String(body.matched_slug).slice(0,64) : null;
    const entry = { q, normalized, matched_slug, ts: new Date().toISOString(), source: String(body.source||'web').slice(0,32), dropped, drop_reason: dropped?'spam_or_secret':null };
    const log = await readLog();
    const idx = log.findIndex(e => e && !e.dropped && e.normalized === normalized);
    if (idx >= 0) {
      const prev = log[idx]; prev.ts = entry.ts; if (matched_slug) prev.matched_slug = matched_slug;
      log.splice(idx,1); log.unshift(prev); await writeLog(log);
      return json({ok:true,deduped:true,entry:{q:prev.q,matched_slug:prev.matched_slug,ts:prev.ts}});
    }
    log.unshift(entry); await writeLog(log);
    if (dropped) return json({ok:true,dropped:true,reason:entry.drop_reason});
    return json({ok:true,entry:{q:entry.q,matched_slug:entry.matched_slug,ts:entry.ts}},201);
  }
  return json({ok:false,error:'not_found'},404);
}

addEventListener('fetch', event => {
  event.respondWith(handle(event.request));
});
