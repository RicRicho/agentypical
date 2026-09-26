# agentypical-questions Worker

Cloudflare Worker for Agentypical Phase 1 living questions index + Phase 2 list-my-service review queue.

**Live URLs**
- https://questions.agentypical.com/api/questions (custom domain)
- https://questions.agentypical.com/api/submissions
- https://agentypical-questions.ric-754.workers.dev/api/questions

**API**
- `GET /api/questions?limit=40` — recent questions (live log + seed)
- `POST /api/questions` — `{ "q": "...", "matched_slug": "dns", "source": "web" }`
- `POST /api/submissions` — `{ "name", "category", "discovery_url", "agent_enrolment?", "notes?", "contact?" }` → 201 pending_review (not auto-public)
- `GET /api/submissions` — ack only; **does not** list the review queue
- Rate limit ~20/min/IP (questions), ~10/min/IP (submissions); spam filter

**Public directory (static Pages, not Worker):**
- https://agentypical.com/directory.json
- https://agentypical.com/directory/{category}.json

**Storage:** Cloudflare Cache API append-only logs (deployed 26 Sep 2026). Preferred KV/R2 blocked on current API token (Workers Scripts + DNS + Workers Domains, no Workers KV Storage). Upgrade path: create KV namespace `agentypical-questions`, bind as `QUESTIONS`, switch to `worker/questions.js`.

**DNS:** Worker custom domain `questions.agentypical.com` (AAAA 100:: proxied). Do not point agentbred.com.
