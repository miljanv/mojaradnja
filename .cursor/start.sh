#!/usr/bin/env bash
# Per-boot startup: ensure PostgreSQL is running before the app starts.
set -euo pipefail

PG_MAJOR=16

echo "==> Starting PostgreSQL cluster"
sudo pg_ctlcluster "${PG_MAJOR}" main start 2>/dev/null || true

# Wait for readiness so downstream terminals/services can connect immediately.
for _ in $(seq 1 30); do
  if sudo -u postgres pg_isready -q; then
    echo "==> PostgreSQL is ready"
    exit 0
  fi
  sleep 1
done

echo "!! PostgreSQL did not become ready in time" >&2
exit 1
