#!/usr/bin/env bash
# Phase 1 Manual Verification Guard — Red baseline for the
# `Measure - User Manual Verification 'Phase 1: BM2 lib/'` task in plan.md.
#
# Per measure/tracks/jsdoc-comments_20260526/test-strategy.md §1, this script is the
# "Static guards (largest)" tier. It is intentionally a shell guard, NOT a vitest file
# (the strategy explicitly bans new vitest files for doc text). It complements the two
# existing Phase 1 guards:
#
#   * check-jsdoc-coverage.sh     : structural  — every function has a summary in graph.db
#   * check-jsdoc-line-length.sh  : prose-shape — no JSDoc continuation line > 120 chars
#   * check-phase-verification.sh : process     — user manual verification has been recorded
#
# Asserts: phase-1-verification-report.md exists, reports `VERIFICATION_RESULT: approved`,
# and has non-placeholder values for `VERIFIED_BY` / `VERIFIED_AT`. Until the user runs the
# Phase Completion Verification and Checkpointing Protocol (workflow.md §70-104) and updates
# the report, the guard fails — that is the Red baseline.
#
# Exit codes:
#   0 = pass (verification recorded as approved)
#   1 = fail (verification missing, pending, rejected, or fields blank)
#   3 = misuse (report file missing or unreadable)
#
# Usage:
#   bash measure/tracks/jsdoc-comments_20260526/scripts/check-phase-verification.sh
#   bash measure/tracks/jsdoc-comments_20260526/scripts/check-phase-verification.sh --json

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
REPORT="${REPO_ROOT}/measure/tracks/jsdoc-comments_20260526/phase-1-verification-report.md"
PHASE_LABEL="Phase 1 (BM2 lib/)"

JSON_MODE=0
if [ "${1:-}" = "--json" ]; then
    JSON_MODE=1
fi

if [ ! -f "${REPORT}" ]; then
    if [ "${JSON_MODE}" = "1" ]; then
        printf '{"phase":"%s","report":"missing","pass":false,"reason":"verification report not found"}\n' "${PHASE_LABEL}"
    else
        echo "ERROR: phase-1-verification-report.md not found at:" >&2
        echo "  ${REPORT}" >&2
        echo "" >&2
        echo "Re-add the verification report template from the Red baseline." >&2
    fi
    exit 3
fi

extract_field() {
    # Pull "FIELD_NAME: value" from anywhere in the report (first match wins).
    # Strips leading/trailing whitespace from the value.
    awk -v key="$1" '
        $0 ~ "^" key ":" {
            sub("^" key ":[[:space:]]*", "", $0)
            sub("[[:space:]]+$", "", $0)
            print
            exit
        }
    ' "${REPORT}"
}

RESULT="$(extract_field VERIFICATION_RESULT)"
VERIFIED_BY="$(extract_field VERIFIED_BY)"
VERIFIED_AT="$(extract_field VERIFIED_AT)"

# Detect un-filled placeholder values.
is_placeholder() {
    case "$1" in
        ""|"<"*">"*|TBD|pending) return 0 ;;
        *) return 1 ;;
    esac
}

PASS=true
REASONS=()

if [ "${RESULT}" != "approved" ]; then
    PASS=false
    REASONS+=("VERIFICATION_RESULT is '${RESULT:-<missing>}' (must be 'approved')")
fi
if is_placeholder "${VERIFIED_BY}"; then
    PASS=false
    REASONS+=("VERIFIED_BY is unfilled ('${VERIFIED_BY}')")
fi
if is_placeholder "${VERIFIED_AT}"; then
    PASS=false
    REASONS+=("VERIFIED_AT is unfilled ('${VERIFIED_AT}')")
fi

if [ "${JSON_MODE}" = "1" ]; then
    # Build JSON reasons array.
    reasons_json="["
    first=1
    for r in "${REASONS[@]:-}"; do
        [ -z "${r}" ] && continue
        if [ "${first}" = "1" ]; then first=0; else reasons_json+=","; fi
        # Escape double quotes in the reason text.
        esc=$(printf '%s' "${r}" | sed 's/"/\\"/g')
        reasons_json+="\"${esc}\""
    done
    reasons_json+="]"
    json_escape() { printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'; }
    printf '{"phase":"%s","report":"%s","verification_result":"%s","verified_by":"%s","verified_at":"%s","pass":%s,"reasons":%s}\n' \
        "${PHASE_LABEL}" \
        "${REPORT#${REPO_ROOT}/}" \
        "$(json_escape "${RESULT}")" \
        "$(json_escape "${VERIFIED_BY}")" \
        "$(json_escape "${VERIFIED_AT}")" \
        "$([ "${PASS}" = "true" ] && echo true || echo false)" \
        "${reasons_json}"
else
    echo "Phase Manual Verification Guard — ${PHASE_LABEL}"
    echo "==================================================="
    echo "Report:               ${REPORT#${REPO_ROOT}/}"
    echo "VERIFICATION_RESULT:  ${RESULT:-<missing>}"
    echo "VERIFIED_BY:          ${VERIFIED_BY:-<missing>}"
    echo "VERIFIED_AT:          ${VERIFIED_AT:-<missing>}"
    echo ""
    if [ "${PASS}" = "true" ]; then
        echo "PASS: Phase 1 manual verification has been recorded as approved."
    else
        echo "FAIL: Phase 1 manual verification has not been completed."
        echo ""
        echo "Open issues:"
        for r in "${REASONS[@]}"; do
            echo "  - ${r}"
        done
        echo ""
        echo "Green path: drive measure/workflow.md §\"Phase Completion Verification and"
        echo "Checkpointing Protocol\" (Steps 1-10), then fill the §\"User verdict\" section"
        echo "of phase-1-verification-report.md with the approved result + verifier + timestamp."
    fi
fi

if [ "${PASS}" = "true" ]; then
    exit 0
fi
exit 1
