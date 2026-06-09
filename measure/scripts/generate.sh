#!/usr/bin/env bash
# generate.sh — Generate Measure architectural facts and documentation.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

echo "[generate] Running scripts/generate-measure-docs.ts..."
npx tsx "$REPO_ROOT/scripts/generate-measure-docs.ts"

echo "[generate] Successfully updated measure/generated/ facts."
exit 0
