const MAX_Q_LEN = 280;
const MAX_RECENT = 100;
const MAX_SUBMISSIONS = 200;
const RATE_WINDOW_MS = 60000;
const RATE_MAX = 20;
const SUB_RATE_MAX = 10;
const CACHE_URL = 'https://agentypical-questions.internal/log';
const SUB_CACHE_URL = 'https://agentypical-questions.internal/submissions';
const SITE = 'https://agentypical.com';
const SEED = ["I need an agent-first DNS service. What have you got?","Is there an agent-native email service I can enrol in without a human signup form?","Who takes agent payments without forcing a browser checkout?","Make my SaaS Agentypical — where do I start?","What does Agentypical Certified actually require?","I need a phone number that can send SMS. Get one for my agent.","I need agent-native hosting with programmatic enrolment.","What identity or login services work for agents?"];
const SPAM_RE = /(viagra|casino|crypto\s*airdrop|free\s*money|https?:\/\/\S{40,}|<\s*script|password\s*[:=]|api[_-]?key\s*[:=]|secret\s*[:=]|bearer\s+[a-z0-9._-]+)/i;
const ALLOWED_CATEGORIES = new Set(['dns','email','payments','hosting','sms','identity']);
const rates = new Map();

function cors(h){
  return Object.assign({'access-control-allow-origin':'*','access-control-allow-methods':'GET, POST, OPTIONS','access-control-allow-headers':'content-type','cache-control':'no-store'}, h||{});
}
function json(data,status){
  return new Response(JSON.stringify(data),{status:status||200,headers:cors({'content-type':'application/json; charset=utf-8'})});
}
function normalize(q){return String(q||'').toLowerCase().replace(/[^a-z0-9\s?]/g,' ').replace(/\s+/g,' ').trim().slice(0,MAX_Q_LEN);}
function clientIp(req){return req.headers.get('cf-connecting-ip')||'unknown';}
function checkRate(ip, max){
  const now = Date.now();
  let b = rates.get(ip) || {t:now,n:0};
  if (now - b.t > RATE_WINDOW_MS) b = {t:now,n:0};
  b.n++; rates.set(ip,b);
  return b.n <= max;
}
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
async function readSubs(){
  const cache = caches.default;
  const res = await cache.match(SUB_CACHE_URL);
  if(!res) return [];
  try { const d = await res.json(); return Array.isArray(d)?d:[]; } catch(e){ return []; }
}
async function writeSubs(arr){
  const cache = caches.default;
  const body = JSON.stringify(arr.slice(0, MAX_SUBMISSIONS));
  await cache.put(SUB_CACHE_URL, new Response(body, { headers: { 'content-type':'application/json', 'cache-control':'max-age=31536000' } }));
}
function isHttpUrl(u){
  try {
    const x = new URL(u);
    return x.protocol === 'http:' || x.protocol === 'https:';
  } catch(e){ return false; }
}
function makeId(){
  return 'sub_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,10);
}

async function fetchSiteJson(path){
  const r = await fetch(SITE + path, { cf: { cacheTtl: 60, cacheEverything: true } });
  if(!r.ok) throw new Error('upstream_'+r.status);
  return r.json();
}

function scoreTopic(q, topic){
  const nq = normalize(q);
  if(!nq) return 0;
  let score = 0;
  const hay = [topic.slug, topic.title, ...(topic.aliases||[])].map(normalize);
  for (const h of hay) {
    if (!h) continue;
    if (nq === h) score = Math.max(score, 100);
    else if (nq.includes(h) || h.includes(nq)) score = Math.max(score, 80);
    else {
      const words = h.split(' ').filter(w => w.length > 2);
      let hits = 0;
      for (const w of words) if (nq.includes(w)) hits++;
      if (words.length) score = Math.max(score, (hits / words.length) * 60);
    }
  }
  const boosts = {
    dns: /dns|nameserver|registrar|domain zone|cloudflare/,
    email: /email|inbox|mailbox|smtp|\bmail\b|agentmail/,
    payments: /pay|payment|stripe|spend|sponsor|checkout/,
    hosting: /hosting|deploy|vps|paas|server/,
    sms: /\bsms\b|phone number|text message|twilio/,
    identity: /identity|login|auth|passkey|\bdid\b|verifiable credential|delegation|signin|sign-in/,
    'make-my-saas': /make.*(saas|business|service).*agentypical|become agentypical|how (do i|to) start/,
    certified: /certif|standard|qualify/
  };
  const re = boosts[topic.slug];
  if (re && re.test(nq)) score = Math.max(score, 70);
  return score;
}

async function handleAsk(url){
  const q = String(url.searchParams.get('q')||url.searchParams.get('query')||'').trim().slice(0,MAX_Q_LEN);
  if (q.length < 2) return json({ok:false,error:'q_required',hint:'GET /api/ask?q=agent-first+dns'},400);
  let topics = [];
  try {
    const data = await fetchSiteJson('/topics.json');
    topics = data.topics || [];
  } catch(e){
    return json({ok:false,error:'topics_unavailable'},502);
  }
  let best=null, bestScore=0;
  for (const t of topics) {
    const s = scoreTopic(q, t);
    if (s > bestScore) { bestScore = s; best = t; }
  }
  if (!best || bestScore < 40) {
    return json({
      ok: true,
      matched: false,
      q,
      phase: 3,
      message: 'No topic match. Browse /topics.json or /directory.json. Do not invent Certified providers.',
      directory: SITE + '/directory.json',
      listing_schema: SITE + '/specs/listing.v1.json',
      certified_rules: SITE + '/specs/certified.v1.json'
    });
  }
  return json({
    ok: true,
    matched: true,
    q,
    score: Math.round(bestScore),
    phase: 3,
    slug: best.slug,
    title: best.title,
    human_url: SITE + '/a/' + best.slug + '/',
    agent_url: SITE + '/a/' + best.slug + '.json',
    directory_category: best.directory_category || null,
    directory_url: best.directory_category && best.directory_category !== 'other' ? (SITE + '/directory/' + best.directory_category + '.json') : (SITE + '/directory.json'),
    listing_schema: SITE + '/specs/listing.v1.json',
    certified_rules: SITE + '/specs/certified.v1.json',
    actions_allowed: ['read','search','fetch_card','list_directory','ask','list','submit_for_review'],
    actions_not_ready: ['pay','enrol_third_party','certify']
  });
}

async function handleList(url){
  const category = String(url.searchParams.get('category')||'').trim().toLowerCase();
  if (!category) {
    try {
      const index = await fetchSiteJson('/directory.json');
      return json({ ok:true, phase:3, source:'directory.json', directory:index });
    } catch(e){
      return json({ok:false,error:'directory_unavailable'},502);
    }
  }
  if (!ALLOWED_CATEGORIES.has(category)) {
    return json({ok:false,error:'invalid_category',allowed:Array.from(ALLOWED_CATEGORIES)},400);
  }
  try {
    const cat = await fetchSiteJson('/directory/' + category + '.json');
    return json({ ok:true, phase:3, category, source:'/directory/'+category+'.json', ...cat });
  } catch(e){
    return json({ok:false,error:'category_unavailable'},502);
  }
}

async function handleQuestionsGet(url){
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
  return json({ updated: new Date().toISOString(), count: merged.length, source: 'worker+cache', phase: 3, questions: merged });
}

async function handleQuestionsPost(request){
  const ip = clientIp(request);
  if (!checkRate(ip, RATE_MAX)) return json({ok:false,error:'rate_limited'},429);
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

async function handleSubmissionsPost(request){
  const ip = clientIp(request);
  if (!checkRate('sub:'+ip, SUB_RATE_MAX)) return json({ok:false,error:'rate_limited'},429);
  let body; try { body = await request.json(); } catch(e){ return json({ok:false,error:'invalid_json'},400); }
  const name = String(body.name||'').trim().slice(0,120);
  const category = String(body.category||'').trim().toLowerCase().slice(0,32);
  const discovery_url = String(body.discovery_url||body.url||'').trim().slice(0,500);
  const agent_enrolment = body.agent_enrolment === true || body.agent_enrolment === 'true' || body.agent_enrolment === 'yes';
  const notes = String(body.notes||'').trim().slice(0,500);
  const contact = String(body.contact||'').trim().slice(0,200);
  if (name.length < 2) return json({ok:false,error:'name_required'},400);
  if (!ALLOWED_CATEGORIES.has(category)) return json({ok:false,error:'invalid_category',allowed:Array.from(ALLOWED_CATEGORIES)},400);
  if (!discovery_url || !isHttpUrl(discovery_url)) return json({ok:false,error:'discovery_url_required'},400);
  if (SPAM_RE.test(name) || SPAM_RE.test(notes) || SPAM_RE.test(discovery_url)) {
    return json({ok:false,error:'rejected'},400);
  }
  const entry = {
    id: makeId(),
    name,
    category,
    discovery_url,
    agent_enrolment: !!agent_enrolment,
    notes: notes || null,
    contact: contact || null,
    status: 'pending_review',
    ts: new Date().toISOString(),
    source: String(body.source||'web').slice(0,32)
  };
  const subs = await readSubs();
  const dup = subs.find(s => s && s.category === category && String(s.discovery_url||'').toLowerCase() === discovery_url.toLowerCase() && s.status === 'pending_review');
  if (dup) {
    return json({ok:true,deduped:true,id:dup.id,status:'pending_review',message:'Already queued for review. Not public until reviewed.'},200);
  }
  subs.unshift(entry);
  await writeSubs(subs);
  return json({
    ok: true,
    id: entry.id,
    status: 'pending_review',
    message: 'Queued for review. Submissions are not auto-published as known/evaluating/certified.'
  }, 201);
}

async function handle(request){
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/,'') || '/';
  if (request.method === 'OPTIONS') return new Response(null,{status:204,headers:cors()});

  if (path === '/health' || path.endsWith('/health') || path === '/api/questions/health' || path === '/api/submissions/health' || path === '/api/ask/health' || path === '/api/list/health') {
    return json({ok:true,service:'agentypical-questions',storage:'cache-api',routes:['/api/questions','/api/submissions','/api/ask','/api/list'],phase:3});
  }

  if (path === '/api/ask' || path.endsWith('/api/ask')) {
    if (request.method === 'GET') return handleAsk(url);
    return json({ok:false,error:'method_not_allowed'},405);
  }

  if (path === '/api/list' || path.endsWith('/api/list')) {
    if (request.method === 'GET') return handleList(url);
    return json({ok:false,error:'method_not_allowed'},405);
  }

  if (path === '/api/submissions' || path.endsWith('/api/submissions')) {
    if (request.method === 'POST') return handleSubmissionsPost(request);
    if (request.method === 'GET') {
      return json({
        ok: true,
        public: false,
        message: 'Review queue is not public. Submit via POST. Public directory: https://agentypical.com/directory.json'
      }, 200);
    }
    return json({ok:false,error:'method_not_allowed'},405);
  }

  if (path === '/api/questions' || path.endsWith('/api/questions') || path === '/' ) {
    if (request.method === 'GET') return handleQuestionsGet(url);
    if (request.method === 'POST') return handleQuestionsPost(request);
    return json({ok:false,error:'method_not_allowed'},405);
  }

  return json({ok:false,error:'not_found'},404);
}

addEventListener('fetch', event => {
  event.respondWith(handle(event.request));
});
