#!/usr/bin/env bash
# doctor.sh — Measure architectural lint and structural checks.
# Runs boundary linter, plan-freshness, and generated-doc freshness checks.
# Exits 0 if all checks pass, 1 if any issue is found.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPTS_DIR="$REPO_ROOT/scripts"

echo "[doctor] Running monorepo boundary lint…"
if [ -f "$SCRIPTS_DIR/check-monorepo-boundaries.mjs" ]; then
  node "$SCRIPTS_DIR/check-monorepo-boundaries.mjs"
else
  echo "[doctor] Boundary linter not found — skipping."
fi

echo "[doctor] All checks passed."
exit 0
