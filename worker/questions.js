/**
 * agentypical-questions — append-only public questions log (Phase 1)
 * GET  /api/questions → merged recent list (live + optional seed)
 * POST /api/questions → { q, matched_slug?, source? } with rate-limit + dupe/spam filter
 * KV binding: QUESTIONS
 */
const MAX_Q_LEN = 280;
const MAX_RECENT = 100;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 20;
const SEED_KEY = 'seed';
const LOG_KEY = 'log';
const RATE_PREFIX = 'rate:';

const SPAM_RE = /(viagra|casino|crypto\s*airdrop|free\s*money|https?:\/\/\S{40,}|<\s*script|password\s*[:=]|api[_-]?key\s*[:=]|secret\s*[:=]|bearer\s+[a-z0-9._-]+)/i;

function cors(headers = {}) {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'cache-control': 'no-store',
    ...headers,
  };
}

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: cors({ 'content-type': 'application/json; charset=utf-8', ...extra }),
  });
}

function normalize(q) {
  return String(q || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_Q_LEN);
}

function clientIp(req) {
  return req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown';
}

async function rateLimit(env, ip) {
  const key = RATE_PREFIX + ip;
  const raw = await env.QUESTIONS.get(key);
  const now = Date.now();
  let bucket = { t: now, n: 0 };
  if (raw) {
    try { bucket = JSON.parse(raw); } catch (_) {}
  }
  if (now - bucket.t > RATE_WINDOW_MS) bucket = { t: now, n: 0 };
  bucket.n += 1;
  await env.QUESTIONS.put(key, JSON.stringify(bucket), { expirationTtl: 120 });
  return bucket.n <= RATE_MAX;
}

async function readLog(env) {
  const raw = await env.QUESTIONS.get(LOG_KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (_) {
    return [];
  }
}

async function readSeed(env) {
  const raw = await env.QUESTIONS.get(SEED_KEY);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.questions)) return data.questions;
  } catch (_) {}
  return [];
}

function entryText(e) {
  return typeof e === 'string' ? e : (e && e.q) || '';
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors() });
    }

    // health
    if (url.pathname === '/api/questions/health' || url.pathname === '/health') {
      return json({ ok: true, service: 'agentypical-questions' });
    }

    if (request.method === 'GET') {
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '40', 10) || 40, MAX_RECENT);
      const live = await readLog(env);
      const seed = await readSeed(env);
      // Prefer live entries first, then seed strings not already present
      const seen = new Set();
      const merged = [];
      for (const e of live) {
        if (e && e.dropped) continue;
        const t = entryText(e);
        const n = normalize(t);
        if (!n || seen.has(n)) continue;
        seen.add(n);
        merged.push(typeof e === 'string' ? e : { q: e.q, matched_slug: e.matched_slug || null, ts: e.ts, source: e.source || 'web' });
        if (merged.length >= limit) break;
      }
      if (merged.length < limit) {
        for (const s of seed) {
          const t = entryText(s);
          const n = normalize(t);
          if (!n || seen.has(n)) continue;
          seen.add(n);
          merged.push(t);
          if (merged.length >= limit) break;
        }
      }
      return json({
        updated: new Date().toISOString(),
        count: merged.length,
        source: 'worker+kv',
        questions: merged,
      });
    }

    if (request.method === 'POST') {
      const ip = clientIp(request);
      if (!(await rateLimit(env, ip))) {
        return json({ ok: false, error: 'rate_limited' }, 429);
      }
      let body;
      try {
        body = await request.json();
      } catch (_) {
        return json({ ok: false, error: 'invalid_json' }, 400);
      }
      const q = String(body.q || body.question || '').trim().slice(0, MAX_Q_LEN);
      if (q.length < 3) return json({ ok: false, error: 'too_short' }, 400);
      const normalized = normalize(q);
      if (!normalized || normalized.length < 3) return json({ ok: false, error: 'invalid' }, 400);
      let dropped = false;
      let drop_reason = null;
      if (SPAM_RE.test(q)) {
        dropped = true;
        drop_reason = 'spam_or_secret';
      }
      const matched_slug = body.matched_slug ? String(body.matched_slug).slice(0, 64) : null;
      const source = body.source ? String(body.source).slice(0, 32) : 'web';
      const entry = {
        q,
        normalized,
        matched_slug,
        ts: new Date().toISOString(),
        source,
        dropped,
        drop_reason,
      };
      const log = await readLog(env);
      // dupe collapse: if same normalized in last 50 non-dropped, bump ts / skip insert
      const existingIdx = log.findIndex(e => e && !e.dropped && e.normalized === normalized);
      if (existingIdx >= 0) {
        const prev = log[existingIdx];
        prev.ts = entry.ts;
        if (matched_slug) prev.matched_slug = matched_slug;
        log.splice(existingIdx, 1);
        log.unshift(prev);
        await env.QUESTIONS.put(LOG_KEY, JSON.stringify(log.slice(0, MAX_RECENT * 2)));
        return json({ ok: true, deduped: true, entry: { q: prev.q, matched_slug: prev.matched_slug, ts: prev.ts } });
      }
      if (!dropped) {
        log.unshift(entry);
        await env.QUESTIONS.put(LOG_KEY, JSON.stringify(log.slice(0, MAX_RECENT * 2)));
        return json({ ok: true, entry: { q: entry.q, matched_slug: entry.matched_slug, ts: entry.ts } }, 201);
      }
      // still record dropped lightly for ops, but don't surface
      log.unshift(entry);
      await env.QUESTIONS.put(LOG_KEY, JSON.stringify(log.slice(0, MAX_RECENT * 2)));
      return json({ ok: true, dropped: true, reason: drop_reason });
    }

    return json({ ok: false, error: 'not_found' }, 404);
  },
};
