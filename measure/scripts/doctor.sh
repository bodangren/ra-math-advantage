#!/usr/bin/env bash
# doctor.sh — Measure architectural lint and structural checks.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPTS_DIR="$REPO_ROOT/scripts"
GENERATED_DIR="$REPO_ROOT/measure/generated"

echo "[doctor] Checking generated documentation..."
if [ ! -f "$GENERATED_DIR/architecture.json" ] || [ ! -f "$GENERATED_DIR/routes.md" ]; then
  echo "[doctor] ERROR: Missing generated documentation. Run 'bash measure/scripts/generate.sh' first."
  exit 1
fi

echo "[doctor] Running monorepo boundary lint..."
if [ -f "$SCRIPTS_DIR/check-monorepo-boundaries.mjs" ]; then
  node "$SCRIPTS_DIR/check-monorepo-boundaries.mjs"
else
  echo "[doctor] ERROR: Boundary linter not found."
  exit 1
fi

echo "[doctor] All checks passed."
exit 0
