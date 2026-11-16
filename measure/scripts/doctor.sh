#!/usr/bin/env bash
# doctor.sh — Measure architectural lint and structural checks.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPTS_DIR="$REPO_ROOT/scripts"
GENERATED_DIR="$REPO_ROOT/measure/generated"

echo "[doctor] Checking generated documentation..."
if [ ! -f "$GENERATED_DIR/architecture.json" ] || [ ! -f "$GENERATED_DIR/routes.md" ] || \
   [ ! -f "$GENERATED_DIR/package-dag.md" ] || [ ! -f "$GENERATED_DIR/ownership.md" ] || \
   [ ! -f "$GENERATED_DIR/exports.md" ] || [ ! -f "$GENERATED_DIR/quality-gates.md" ]; then
  echo "[doctor] ERROR: Missing generated documentation. Run 'bash measure/scripts/generate.sh' first."
  exit 1
fi

node "$SCRIPTS_DIR/architecture/generate-architecture-reports.mjs" --check

echo "[doctor] Running monorepo boundary lint..."
if [ -f "$SCRIPTS_DIR/check-monorepo-boundaries.mjs" ]; then
  node "$SCRIPTS_DIR/check-monorepo-boundaries.mjs"
else
  echo "[doctor] ERROR: Boundary linter not found."
  exit 1
fi

echo "[doctor] All checks passed."
exit 0
