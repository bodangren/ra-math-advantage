#!/usr/bin/env bash
# check-srs-validator-parity.sh
# Verify VALID_STATE_TRANSITIONS transition rules match across all locations.
# Compares only the data values (state→allowed_states mappings), not type signatures.
# Exits 0 if all match, 1 if any mismatch is found.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

CANONICAL="$REPO_ROOT/packages/srs-engine/src/srs/transition-validator.ts"
COPIES=(
  "$REPO_ROOT/apps/integrated-math-3/convex/srs/processReview.ts"
  "$REPO_ROOT/apps/integrated-math-3/convex/srs/reviews.ts"
  "$REPO_ROOT/apps/bus-math-v2/convex/srs.ts"
)

# Extract the transition mapping (state: [...allowed_next_states...]) from VALID_STATE_TRANSITIONS.
# Sorts keys for stable comparison regardless of declaration order.
extract_transitions() {
  local file="$1"
  awk '
    /const VALID_STATE_TRANSITIONS/ { found=1; next }
    found && /new:|learning:|review:|relearning:/ {
      gsub(/^[[:space:]]+/, "")
      gsub(/[,[:space:]]*$/, "")
      gsub(/: /, ":")
      gsub(/'\''/,"")
      print
    }
    found && /^[[:space:]]*};/ { exit }
  ' "$file" | sort
}

CANONICAL_TRANSITIONS=$(extract_transitions "$CANONICAL")

MISMATCHES=0

for file in "${COPIES[@]}"; do
  COPY_TRANSITIONS=$(extract_transitions "$file")
  if [ "$CANONICAL_TRANSITIONS" != "$COPY_TRANSITIONS" ]; then
    echo "MISMATCH in $file"
    echo "  Canonical transitions:"
    echo "$CANONICAL_TRANSITIONS" | sed 's/^/    /'
    echo "  Copy transitions:"
    echo "$COPY_TRANSITIONS" | sed 's/^/    /'
    MISMATCHES=$((MISMATCHES + 1))
  fi
done

if [ $MISMATCHES -gt 0 ]; then
  echo ""
  echo "Found $MISMATCHES drift mismatch(es). Update inline copies to match packages/srs-engine/src/srs/transition-validator.ts"
  exit 1
fi

echo "SRS validator drift check passed: all copies match canonical."
exit 0
