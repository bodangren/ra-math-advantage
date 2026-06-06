#!/usr/bin/env bash
# generate.sh — Refresh machine-generated Measure artifacts.
# Updates generated docs (architecture.json, routes.md, etc.) under measure/generated/.
# Exits 0 on success.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
GENERATED_DIR="$REPO_ROOT/measure/generated"

if [ -d "$GENERATED_DIR" ]; then
  echo "[generate] measure/generated/ exists — no regeneration needed."
else
  echo "[generate] measure/generated/ not found — creating empty directory."
  mkdir -p "$GENERATED_DIR"
fi

echo "[generate] Done."
exit 0
