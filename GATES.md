# Agentypical.com Phase 1 — Acceptance Gates

**Date started:** 2026-09-26 (AEST)
**Ticket:** RIC-191
**Sources:** team wiki Agentypical/Interactive_build · Drive doc 1Pzhnp_HmJymGNdsjiyExstWL03rJvxoizq0VbeuTJHg

Do not mark Done until every gate has evidence (curl 200 + content checks).

| # | Gate | Acceptance | Status | Evidence |
|---|------|------------|--------|----------|
| 1 | Stable `/a/{slug}` pages | Seed topics dns, email, payments, hosting, sms, make-my-saas, certified each have shareable URL that survives refresh | PENDING | |
| 2 | Real search | Home search matches curated topic set (not only five canned drafts) and navigates to `/a/{slug}` | PENDING | |
| 3 | Live questions writeback | Recent questions from real queries; spam/dupe filter; CF Worker + KV/R2 (not localStorage); serves/regenerates questions feed | PENDING | |
| 4 | Answer page content | Each page: human short answer + denser agent answer + aim-your-agent prompt block | PENDING | |
| 5 | Agent endpoints open | `/agent/`, `llms.txt`, `.well-known/agentypical.json` still 200; no login wall; no fake Certified directory cards | PENDING | |
| 6 | Hosting unchanged | GitHub Pages RicRicho/agentypical; CF apex/www → ricricho.github.io proxied; agentbred.com not pointed | PENDING | |

## Domain names wiki
Verified 2026-09-26: https://wiki.ricricho.com/team/index.php?title=Domain_names — complete (9 zones). No redo.

## Notes
- Prefer Worker route under agentypical.com (`/api/questions` or `questions.agentypical.com`).
- Sign wiki as Agent; email as Max for Ric; Linear Agent: Max; human assignee Ric.
