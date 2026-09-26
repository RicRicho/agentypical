# Agentypical.com Phase 1 — Acceptance Gates

**Date:** 2026-09-26 (AEST)
**Ticket:** RIC-191
**Commit:** bd3546c39b0caa6674fc09462e99419b492adabc
**Sources:** team wiki Agentypical/Interactive_build · Drive doc 1Pzhnp_HmJymGNdsjiyExstWL03rJvxoizq0VbeuTJHg

| # | Gate | Status | Evidence |
|---|------|--------|----------|
| 1 | Stable `/a/{slug}` pages | **PASS** | curl 200: /a/dns/ /a/email/ /a/payments/ /a/hosting/ /a/sms/ /a/make-my-saas/ /a/certified/ — human+agent+aim present; /a/dns.json has none_yet |
| 2 | Real search | **PASS** | Home loads topics.json; search navigates to /a/{slug} (client match against curated set, not five canned drafts) |
| 3 | Live questions writeback | **PASS** | Worker https://questions.agentypical.com/api/questions GET+POST 200/201; non-seed entry after POST; spam/dupe filter; storage=Cache API (KV permission absent on token — documented in worker/README.md). Not localStorage. |
| 4 | Answer page content | **PASS** | Each /a/{slug}/ has Human answer + Agent answer (denser) + Aim your agent prompt |
| 5 | Agent endpoints open | **PASS** | /agent/ /llms.txt /.well-known/agentypical.json 200; no login; no fake Certified cards |
| 6 | Hosting unchanged | **PASS** | Pages RicRicho/agentypical; apex+www → ricricho.github.io proxied; agentbred.com DNS records=0 |

## Domain names wiki
Verified complete: https://wiki.ricricho.com/team/index.php?title=Domain_names — no redo.

## Worker
- Script: agentypical-questions
- Custom domain: questions.agentypical.com
- workers.dev: https://agentypical-questions.ric-754.workers.dev/
