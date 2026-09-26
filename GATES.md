# Agentypical.com Phase 2 — Acceptance Gates

**Date:** 2026-09-26 (AEST)
**Ticket:** RIC-192
**Ship tip commit:** `dbd9875e03c48f9fcf530fd980546625f6e9413b` (home + links). Worker script `agentypical-questions` redeployed same day (Cache API `/api/submissions`). Prior Phase 2 commits: `6acf5d24` directory JSON · `17464238` discovery · `b474c925` list-my-service · `71bc13ad`+`25c2be92`+`38242b42`+`cd3e93cc` answer Directory sections · `3707eec7` Worker source.
**Sources:** team wiki Agentypical/Interactive_build · Drive doc 1Pzhnp_HmJymGNdsjiyExstWL03rJvxoizq0VbeuTJHg

| # | Gate | Status | Evidence |
|---|------|--------|----------|
| 1 | Directory section on seed topic pages | **PASS** | 2026-09-26 AEST: `curl` `/a/{dns,email,payments,hosting,sms,make-my-saas,certified}/` → HTTP 200; each contains `id="directory"` + honest `none_yet` / empty-directory copy (not a marketplace). |
| 2 | List-my-service → review queue (not auto-public) | **PASS** | Form live `/list-my-service/` → POST `https://questions.agentypical.com/api/submissions` → **201** `{"ok":true,"status":"pending_review",...}`. GET `/api/submissions` → ack only (`public":false`, does not list queue). `/directory/dns.json` still `"status":"none_yet","cards":[]` after submit. |
| 3 | Agent-readable category lists + discovery | **PASS** | `/directory.json` + `/directory/{dns,email,payments,hosting,sms}.json` HTTP 200. `.well-known/agentypical.json`: `"phase":"2"`, `actions_allowed` includes `list_directory` + `submit_for_review`. `llms.txt` links directory index + category pattern. |
| 4 | No fake Certified; agentbred.com unpointed | **PASS** | All public category `cards: []` / `status: none_yet`. Cloudflare `agentbred.com` zone DNS **count=0** (no records; not pointed). |
| 5 | Phase 1 health | **PASS** | `/a/{slug}/` 200; `GET https://questions.agentypical.com/api/questions?limit=1` → 200; `/health` → `{"ok":true,"storage":"cache-api","routes":["/api/questions","/api/submissions"],"phase":2}`. |

## Worker
- Script: `agentypical-questions` (Phase 2 extended)
- Routes: `/api/questions`, `/api/submissions`, `/health`
- Custom domain: `questions.agentypical.com`
- Storage: **Cache API** (Workers KV still unavailable on vault token; same pattern as Phase 1)

## Domain
- agentypical.com apex+www → ricricho.github.io
- questions.agentypical.com Worker route
- agentbred.com: **do not point** (still empty)
