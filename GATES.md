# Agentypical.com Phase 3 — Acceptance Gates

**Date:** 2026-09-26 (AEST)
**Ticket:** RIC-193
**Ship tip commit:** _(filled after push)_
**Sources:** team wiki Agentypical/Interactive_build · Drive doc 1Pzhnp_HmJymGNdsjiyExstWL03rJvxoizq0VbeuTJHg · Ric go email thread b701636b

| # | Gate | Status | Evidence |
|---|------|--------|----------|
| 1 | ≥3 real cards; status known\|evaluating only; zero certified | **PENDING** | CHECK `/directory.json` cards across categories |
| 2 | Listing schema URL 200 + format/schema version | **PENDING** | CHECK `/specs/listing.v1.json` |
| 3 | Certified rules URL 200 + plain rules | **PENDING** | CHECK `/specs/certified.v1.json` + `/specs/certified/` |
| 4 | Identity/login category + answer page | **PENDING** | CHECK `/directory/identity.json` + `/a/identity/` |
| 5 | Discovery phase 3; Phase 1/2 health OK | **PENDING** | CHECK `.well-known`, `llms.txt`, answers, questions + submissions APIs |
| 6 | agentbred.com still unpointed (DNS count 0) | **PENDING** | Cloudflare zones read |
| 7 | No regression: list-my-service review-queue; no invented listings beyond three seeds | **PENDING** | POST submissions → pending_review; directory card count = 3 |

## Seeds (honest)
1. Cloudflare DNS/API — `dns` — `known` — https://developers.cloudflare.com/api/
2. AgentMail — `email` — `known` — https://www.agentmail.to/docs/introduction
3. Stripe API — `payments` — `evaluating` — https://docs.stripe.com/api

## Worker
- Script: `agentypical-questions` (Phase 3)
- Routes: `/api/questions`, `/api/submissions`, `/api/ask`, `/api/list`, `/health`
- Custom domain: `questions.agentypical.com`
- Storage: Cache API

## Domain
- agentypical.com apex+www → ricricho.github.io
- questions.agentypical.com Worker route
- agentbred.com: **do not point** (still empty)
