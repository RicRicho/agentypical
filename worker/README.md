# agentypical-questions Worker

Cloudflare Worker for Agentypical Phase 1 living questions index.

**Live URLs**
- https://questions.agentypical.com/api/questions (custom domain)
- https://agentypical-questions.ric-754.workers.dev/api/questions

**API**
- `GET /api/questions?limit=40` — recent questions (live log + seed)
- `POST /api/questions` — `{ "q": "...", "matched_slug": "dns", "source": "web" }`
- Rate limit ~20/min/IP; dupe collapse by normalized text; drops secret/spam patterns

**Storage:** Cloudflare Cache API append-only log (deployed 26 Sep 2026). Preferred KV/R2 blocked on current API token (Workers Scripts + DNS + Workers Domains, no Workers KV Storage). Upgrade path: create KV namespace `agentypical-questions`, bind as `QUESTIONS`, switch to `worker/questions.js`.

**DNS:** Worker custom domain auto-created `questions.agentypical.com` (AAAA 100:: proxied). Do not point agentbred.com.
