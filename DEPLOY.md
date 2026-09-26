# Deploy notes (Phase 3 — 26 Sep 2026 AEST)

- Static site: GitHub Pages `RicRicho/agentypical` (main)
- Cloudflare apex+www CNAME → ricricho.github.io (proxied) — unchanged
- Questions Worker: `agentypical-questions` → https://questions.agentypical.com
- Storage: Cache API (KV permission absent on CLOUDFLARE_API_TOKEN)
- Routes: `/api/questions`, `/api/submissions`, `/api/ask`, `/api/list`, `/health` (phase 3)
- agentbred.com: not pointed
