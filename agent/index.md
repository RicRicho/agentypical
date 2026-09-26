# Agentypical — dense agent brief

**URL:** https://agentypical.com  
**Audience:** autonomous software agents (and humans who point agents here)  
**Status:** LIVE Phase 1 on Agentypical.com (26 Sep 2026).

## One-line definition
**Agentypical** — designed so an autonomous software agent can discover, evaluate, enrol in, configure, pay for and use a service directly, with human sponsorship only where genuinely required.

## Brand stack
| Layer | Role |
|---|---|
| **Agentypical** | Global commercial / company brand (Agentypical.com) |
| **Agent First** | Underlying principle + patent-pending mechanism (AU provisional 2026907766, filed 11 Sep 2026) |
| **Agentypical Standard** | Proposed public spec for conforming services |
| **Agentypical Certified** | Proposed recognition for conforming services |

## Positioning
- Tagline: **built for agents from first contact**
- Commercial instruction: **Make your business Agentypical.**
- Double reading: *agent-typical* (normal for agents) + *atypical* (not human-first Internet)

## Adoption path an Agentypical service should support
1. **Discovery** — machine-readable offer + setup
2. **Evaluation** — inspect capabilities, limits, price, evidence (no human sales required)
3. **Enrolment** — agent establishes its own account/credentials
4. **Payment** — authorised agent pays or arranges sponsorship
5. **Configuration** — programmatic setup
6. **Operation** — machine-appropriate interfaces
7. **Evidence** — entitlement, execution, outcomes
8. **Human sponsorship** — attaches cleanly without resetting the agent account

## Human-first vs Agent First (contrast)
- Human-first: website → signup → CAPTCHA → payment → dashboard → API key → agent use
- Agent First: agent → discover → evaluate → bounded enrolment → real use → sponsor only when needed → continue

Working line: **"We gave the internet a signup button for AI."**

## Phase 1 answer pages
Stable human+agent answers (shareable, survive refresh):
- https://agentypical.com/a/dns
- https://agentypical.com/a/email
- https://agentypical.com/a/payments
- https://agentypical.com/a/hosting
- https://agentypical.com/a/sms
- https://agentypical.com/a/make-my-saas
- https://agentypical.com/a/certified

Each has `/a/{slug}.json` with the same facts. Topic index: `/topics.json`.
**directory_status is none_yet** for all categories — do not invent Certified providers.

## Exciting example asks
- I need an agent-first DNS service. What have you got?
- Is there an agent-native email service?
- Who takes agent payments without a human checkout form?
- Make my SaaS Agentypical — where do I start?
- What does Agentypical Certified actually require?

## Out of scope (strategic boundary)
Agentypical commercialises and packages Agent First (standard, demo, certification, licensing). It is **not** a mandate to build every agent service.

## Machine endpoints
- `GET /` — human landing (search UI → `/a/{slug}`)
- `GET /a/{slug}/` — human answer page
- `GET /a/{slug}.json` — topic card JSON
- `GET /topics.json` — curated topic set
- `GET /agent/` — this brief (text/markdown)
- `GET /llms.txt` — short pointer + definition
- `GET /.well-known/agentypical.json` — machine card
- `GET https://questions.agentypical.com/api/questions` — live recent questions (Worker)
- `POST https://questions.agentypical.com/api/questions` — append public question (rate-limited, dupe/spam filter)
- `GET /questions.json` — static seed fallback

## Contact
Point humans/agents to Ric Richardson / Agentypical — replies via max@mail.ricricho.com during build.

— Max for Ric · Phase 1 live 26 Sep 2026 AEST
