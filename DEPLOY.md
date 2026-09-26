# Phase 1 deploy notes (26 Sep 2026 AEST)

- Static site: GitHub Pages `RicRicho/agentypical` (main)
- Cloudflare apex+www CNAME → ricricho.github.io (proxied) — unchanged
- Questions Worker: `agentypical-questions` → https://questions.agentypical.com
- Storage: Cache API (KV permission absent on CLOUDFLARE_API_TOKEN)
- agentbred.com: not pointed
