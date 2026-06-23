#!/usr/bin/env bash
# Phase 9 Verification Guard — Red baseline test for jsdoc-comments_20260526.
#
# Asserts: phase-9-verification-report.md §"User verdict" has VERIFICATION_RESULT: approved
# and non-placeholder VERIFIED_BY and VERIFIED_AT fields.
#
# Sibling of check-phase-verification.sh (Phase 1), check-phase-verification-2.sh (Phase 2),
# ..., check-phase-verification-8.sh (Phase 8). Same assertion shape, different report file.
#
# Exit codes:
#   0 = pass (verification approved)
#   1 = fail (verification pending or fields unfilled)
#   3 = misuse (report file not found)
#
# Usage:
#   bash measure/tracks/jsdoc-comments_20260526/scripts/check-phase-verification-9.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
REPORT="${REPO_ROOT}/measure/tracks/jsdoc-comments_20260526/phase-9-verification-report.md"

if [ ! -f "${REPORT}" ]; then
    echo "ERROR: Verification report not found at ${REPORT}" >&2
    exit 3
fi

RESULT_LINE=$(grep -E '^VERIFICATION_RESULT:' "${REPORT}" | head -1 || echo "")
BY_LINE=$(grep -E '^VERIFIED_BY:' "${REPORT}" | head -1 || echo "")
AT_LINE=$(grep -E '^VERIFIED_AT:' "${REPORT}" | head -1 || echo "")

RESULT_VALUE=$(echo "${RESULT_LINE}" | sed 's/^VERIFICATION_RESULT:[[:space:]]*//' | tr -d '[:space:]')
BY_VALUE=$(echo "${BY_LINE}" | sed 's/^VERIFIED_BY:[[:space:]]*//' | tr -d '[:space:]')
AT_VALUE=$(echo "${AT_LINE}" | sed 's/^VERIFIED_AT:[[:space:]]*//' | tr -d '[:space:]')

FAILURES=0

if [ "${RESULT_VALUE}" != "approved" ]; then
    echo "FAIL: VERIFICATION_RESULT is '${RESULT_VALUE:-<missing>}', expected 'approved'"
    FAILURES=$((FAILURES + 1))
fi

if [ -z "${BY_VALUE}" ] || echo "${BY_VALUE}" | grep -qiE '<.*placeholder.*>|<.*real.*name.*>|pending'; then
    echo "FAIL: VERIFIED_BY is '${BY_VALUE:-<missing>}' (placeholder or missing)"
    FAILURES=$((FAILURES + 1))
fi

if [ -z "${AT_VALUE}" ] || echo "${AT_VALUE}" | grep -qiE '<.*ISO.*>|<.*timestamp.*>|pending'; then
    echo "FAIL: VERIFIED_AT is '${AT_VALUE:-<missing>}' (placeholder or missing)"
    FAILURES=$((FAILURES + 1))
fi

if [ "${FAILURES}" = "0" ]; then
    echo "PASS: Phase 9 verification approved by ${BY_VALUE} at ${AT_VALUE}"
    exit 0
fi

echo ""
echo "FAIL: ${FAILURES} unfilled field(s) in phase-9-verification-report.md §User verdict"
exit 1
