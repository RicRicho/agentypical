# agentypical-questions Worker

Cloudflare Worker for Agentypical Phase 1–3: living questions, list-my-service review queue, lightweight ask/list.

**Live URLs**
- https://questions.agentypical.com/api/questions
- https://questions.agentypical.com/api/submissions
- https://questions.agentypical.com/api/ask?q=
- https://questions.agentypical.com/api/list?category=
- https://questions.agentypical.com/health

**API**
- `GET /api/ask?q=` — match a topic (proxies `/topics.json`)
- `GET /api/list` — full directory index; `GET /api/list?category=dns` — category cards
- `GET|POST /api/questions` — recent questions log
- `POST /api/submissions` — review queue (not auto-public); categories: dns,email,payments,hosting,sms,identity
- `GET /api/submissions` — ack only

**Storage:** Cache API. **Phase:** 3. Do not point agentbred.com.
