#!/bin/bash
set -euo pipefail
cd /tmp
curl -fsSL "https://raw.githubusercontent.com/RicRicho/agentypical/main/_build/phase2-rest.tgz.b64" -o t.b64
base64 -d < t.b64 > rest.tgz
rm -rf agy-rest agy-work
mkdir agy-rest
tar xzf rest.tgz -C agy-rest
git clone --depth 1 "https://x-access-token:${GITHUB_TOKEN}@github.com/RicRicho/agentypical.git" agy-work
cd agy-work
git config user.name "Max for Ric"
git config user.email "max@mail.ricricho.com"
# remove build artifact from tree after extract overlay
cp -a /tmp/agy-rest/. .
rm -rf _build
git add -A
git status --short
git commit -m "Phase 2c: Worker submissions, list-my-service, directory UI, topics/home/agent

Max for Ric <max@mail.ricricho.com>
RIC-192"
git push origin main
echo "PUSH_SHA=$(git rev-parse HEAD)"
cp worker/questions-sw.js /tmp/worker.mjs
BOUNDARY='----AgentypicalBoundary7MA4YWxkTrZu0gW'
META='{"main_module":"worker.mjs","compatibility_date":"2026-09-01","bindings":[]}'
{
  printf -- '--%s\r\nContent-Disposition: form-data; name="metadata"\r\nContent-Type: application/json\r\n\r\n%s\r\n' "$BOUNDARY" "$META"
  printf -- '--%s\r\nContent-Disposition: form-data; name="worker.mjs"; filename="worker.mjs"\r\nContent-Type: application/javascript+module\r\n\r\n' "$BOUNDARY"
  cat /tmp/worker.mjs
  printf -- '\r\n--%s--\r\n' "$BOUNDARY"
} > /tmp/upload.bin
RESP=$(curl -sS -X PUT \
  "https://api.cloudflare.com/client/v4/accounts/575417eca8f9e1ed9a77f880c07a057e/workers/scripts/agentypical-questions" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: multipart/form-data; boundary=${BOUNDARY}" \
  --data-binary @/tmp/upload.bin)
echo "$RESP" | python3 -c 'import sys,json; d=json.load(sys.stdin); print("CF_SUCCESS", d.get("success")); print("CF_ERRORS", d.get("errors")); r=d.get("result") or {}; print("CF_ETAG", (r.get("etag") or "")[:32])'
sleep 2
echo -n "HEALTH "; curl -sS https://questions.agentypical.com/health; echo
echo -n "SUBGET "; curl -sS https://questions.agentypical.com/api/submissions; echo
echo -n "SUBPOST "; curl -sS -X POST https://questions.agentypical.com/api/submissions -H 'content-type: application/json' -d '{"name":"Phase2 Gate Probe","category":"dns","discovery_url":"https://example.com/agent-discovery","agent_enrolment":true,"notes":"gate probe","source":"gate"}'; echo
echo DONE
