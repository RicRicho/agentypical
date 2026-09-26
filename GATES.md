# Agentypical.com Phase 3 — Acceptance Gates

**Date:** 2026-09-26 (AEST)
**Ticket:** RIC-193
**Ship tip commit:** `d31d3ce3378e654e3f9d1e2fb23b07a8d5057c74` (follow-up tip before this GATES PASS commit; prior note `d159d6d`)
**Worker:** `agentypical-questions` Phase 3 live (ask/list deployed 26 Sep 2026 AEST)
**Sources:** team wiki Agentypical/Interactive_build · Drive doc 1Pzhnp_HmJymGNdsjiyExstWL03rJvxoizq0VbeuTJHg · Ric go email thread b701636b

| # | Gate | Status | Evidence |
|---|------|--------|----------|
| 1 | ≥3 real cards; status known\|evaluating only; zero certified | **PASS** | `/directory.json` 200, `phase:3`, `format_version:"1"`; 3 cards — Cloudflare DNS (`known`), AgentMail (`known`), Stripe API (`evaluating`); certified count 0 |
| 2 | Listing schema URL 200 + format/schema version | **PASS** | `/specs/listing.v1.json` 200; human `/specs/listing/` 200 |
| 3 | Certified rules URL 200 + plain rules | **PASS** | `/specs/certified.v1.json` 200; human `/specs/certified/` 200 |
| 4 | Identity/login category + answer page | **PASS** | `/directory/identity.json` 200, `status:none_yet`, `cards:[]`; `/a/identity/` 200 |
| 5 | Discovery phase 3; Phase 1/2 health OK + ask/list | **PASS** | `.well-known/agentypical.json` phase 3, `actions_allowed` includes ask+list; Worker `/health` phase 3 routes ask/list; `GET /api/ask?q=dns` → matched true; `GET /api/list?category=dns` → ok + card(s); `/api/questions` 200 phase 3 |
| 6 | agentbred.com still unpointed (DNS count 0) | **PASS** | Cloudflare zones `agentbred.com` count=0, records=[] (zone kept, not pointed) |
| 7 | No regression: list-my-service review-queue; three seeds only | **PASS** | `POST /api/submissions` → 201 `status:pending_review`; directory total cards = 3 (no invented Certified) |

## Seeds (honest)
1. Cloudflare DNS/API — `dns` — `known` — https://developers.cloudflare.com/api/
2. AgentMail — `email` — `known` — https://www.agentmail.to/docs/introduction
3. Stripe API — `payments` — `evaluating` — https://docs.stripe.com/api

## Worker
- Script: `agentypical-questions` (Phase 3)
- Routes: `/api/questions`, `/api/submissions`, `/api/ask`, `/api/list`, `/health`
- Custom domain: `questions.agentypical.com`
- Storage: Cache API
- Deploy: Cloudflare Workers Scripts API PUT (success=true, HTTP 200) — Max for Ric, 26 Sep 2026 AEST

## Domain
- agentypical.com apex+www → ricricho.github.io
- questions.agentypical.com Worker route
- agentbred.com: **do not point** (still empty — PASS)
