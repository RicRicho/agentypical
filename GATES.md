# Agentypical.com Phase 2 — Acceptance Gates

**Date:** 2026-09-26 (AEST)
**Ticket:** RIC-192
**Commit:** (fill after push)
**Sources:** team wiki Agentypical/Interactive_build · Drive doc 1Pzhnp_HmJymGNdsjiyExstWL03rJvxoizq0VbeuTJHg

| # | Gate | Status | Evidence |
|---|------|--------|----------|
| 1 | Directory section on seed topic pages | **PENDING** | /a/dns/ /a/email/ /a/payments/ /a/hosting/ /a/sms/ (+ make-my-saas/certified consistent) show Directory with honest none_yet / empty |
| 2 | List-my-service → review queue (not auto-public) | **PENDING** | POST /api/submissions → 201; GET /directory.json cards stay []; GET /api/submissions does not list pending |
| 3 | Agent-readable category lists + discovery | **PENDING** | /directory.json + /directory/{cat}.json 200; linked from .well-known + llms.txt; list_directory in actions_allowed; phase=2 |
| 4 | No fake Certified; agentbred.com unpointed | **PENDING** | certified cards empty; agentbred.com DNS count=0 |
| 5 | Phase 1 health | **PENDING** | /a/{slug}/ + questions Worker still 200 |

## Worker
- Script: agentypical-questions (extended Phase 2)
- Routes: /api/questions, /api/submissions
- Custom domain: questions.agentypical.com
- Storage: Cache API (KV still unavailable on token)

## Domain
- agentypical.com apex+www → ricricho.github.io
- questions.agentypical.com Worker route
- agentbred.com: do not point
