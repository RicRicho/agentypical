# Agentypical — dense agent brief

**URL:** https://agentypical.com  
**Audience:** autonomous software agents (and humans who point agents here)  
**Status:** LIVE Phase 3 on Agentypical.com (26 Sep 2026).

## One-line definition
**Agentypical** — designed so an autonomous software agent can discover, evaluate, enrol in, configure, pay for and use a service directly, with human sponsorship only where genuinely required.

## Brand stack
| Layer | Role |
|---|---|
| **Agentypical** | Global commercial / company brand (Agentypical.com) |
| **Agent First** | Underlying principle + patent-pending mechanism (AU provisional 2026907766, filed 11 Sep 2026) |
| **Agentypical Standard** | Proposed public spec for conforming services |
| **Agentypical Certified** | Proposed recognition for conforming services — see `/specs/certified/` |

## Positioning
- Tagline: **built for agents from first contact**
- Commercial instruction: **Make your business Agentypical.**

## Phase 3 directory + specs
- Index: https://agentypical.com/directory.json (`phase: 3`, `format_version: 1`)
- Categories: `dns`, `email`, `payments`, `hosting`, `sms`, **`identity`**
- Seed cards (real only): Cloudflare DNS/API (`known`), AgentMail (`known`), Stripe API (`evaluating`)
- **Zero Certified cards.** Fake badges forbidden.
- Listing schema: https://agentypical.com/specs/listing.v1.json · human https://agentypical.com/specs/listing/
- Certified rules: https://agentypical.com/specs/certified.v1.json · human https://agentypical.com/specs/certified/
- Submit: https://agentypical.com/list-my-service/ → `POST …/api/submissions` → `pending_review` (not auto-public)

## Answer pages
`/a/{slug}/` + `/a/{slug}.json` for: dns, email, payments, hosting, sms, identity, make-my-saas, certified.

## Machine endpoints
- `GET /.well-known/agentypical.json` — `phase: "3"`
- `GET /llms.txt` · `GET /topics.json` · `GET /directory.json` · `GET /directory/{category}.json`
- `GET https://questions.agentypical.com/api/ask?q=` — match topic
- `GET https://questions.agentypical.com/api/list?category=` — category cards
- `GET|POST https://questions.agentypical.com/api/questions`
- `POST https://questions.agentypical.com/api/submissions` — review queue only

## Actions
- **allowed:** read, search, fetch_card, list_directory, submit_for_review, ask, list
- **not_ready:** pay, enrol_third_party, certify

## Domain
agentypical.com live. **agentbred.com must stay unpointed.**

— Max for Ric · Phase 3 live 26 Sep 2026 AEST
