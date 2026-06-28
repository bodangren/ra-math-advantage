#!/usr/bin/env bash
# Phase 5 Verification Process Integrity Guard — Red baseline for
# `Spec Compliance and Process Integrity Remediation` Phase 5.
#
# Per measure/tracks/spec-compliance-and-process-integrity_20260612/test-strategy.md §5,
# this is an artifact-only shell guard (no vitest). It checks every archived
# jsdoc-comments_20260526 phase verification report for two process-integrity
# properties required by spec.md FR-6 / FR-7:
#
#   1. VERIFICATION_RESULT must be "approved" (not pending / rejected / missing).
#   2. VERIFIED_BY must be a genuine human verifier, not automation or a bot.
#
# The guard is intentionally strict: any report that is still pending, any report
# that was self-approved by automation/measure-mid/bot values, or any report with
# blank/placeholder verifier/timestamp is a failure.
#
# Exit codes:
#   0 = pass (all reports approved by a non-automation verifier)
#   1 = fail (one or more reports violate process integrity)
#   3 = misuse (report directory missing or zero reports found — anti-vacuous-pass)
#
# Usage:
#   bash measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-phase-verification-guards.sh
#   bash measure/tracks/spec-compliance-and-process-integrity_20260612/scripts/check-phase-verification-guards.sh --json
#
# Override the report search directory for runner-plumbing self-tests:
#   REPORTS_DIR=/path/to/fixture/dir bash .../check-phase-verification-guards.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
REPORTS_DIR="${REPORTS_DIR:-${REPO_ROOT}/measure/archive/jsdoc-comments_20260526}"
PHASE_LABEL="Phase 5 (Verification Process Integrity)"

JSON_MODE=0
if [ "${1:-}" = "--json" ]; then
    JSON_MODE=1
fi

if [ ! -d "${REPORTS_DIR}" ]; then
    if [ "${JSON_MODE}" = "1" ]; then
        printf '{"phase":"%s","reports_dir":"%s","reports_found":0,"pass":false,"reason":"reports directory not found"}\n' \
            "${PHASE_LABEL}" "${REPORTS_DIR}"
    else
        echo "ERROR: reports directory not found:" >&2
        echo "  ${REPORTS_DIR}" >&2
    fi
    exit 3
fi

# Discover phase verification reports. Sort for deterministic output.
mapfile -t REPORTS < <(find "${REPORTS_DIR}" -maxdepth 1 -type f -name 'phase-*-verification-report.md' | sort)

if [ "${#REPORTS[@]}" -eq 0 ]; then
    if [ "${JSON_MODE}" = "1" ]; then
        printf '{"phase":"%s","reports_dir":"%s","reports_found":0,"pass":false,"reason":"no phase verification reports found"}\n' \
            "${PHASE_LABEL}" "${REPORTS_DIR}"
    else
        echo "ERROR: no phase-*-verification-report.md files found in:" >&2
        echo "  ${REPORTS_DIR}" >&2
    fi
    exit 3
fi

extract_field() {
    local file="$1"
    local key="$2"
    awk -v key="$key" '
        $0 ~ "^" key ":" {
            sub("^" key ":[[:space:]]*", "", $0)
            sub("[[:space:]]+$", "", $0)
            print
            exit
        }
    ' "${file}"
}

# Detect un-filled placeholder values.
is_placeholder() {
    case "$1" in
        ""|"<"*">"*|TBD|pending) return 0 ;;
        *) return 1 ;;
    esac
}

# Detect automation / bot / non-human verifier values.
# Uses a case-insensitive substring match against a fixed list of banned identities.
is_automation_verifier() {
    local value="$1"
    local lower
    lower="$(printf '%s' "${value}" | tr '[:upper:]' '[:lower:]')"
    case "${lower}" in
        *automation*|*measure-mid*|*measure-mid-red*|*measure-green*|*bot*|*ai-agent*|*llm*|*machine*)
            return 0 ;;
        *) return 1 ;;
    esac
}

PASS=true
REASONS=()
REPORT_COUNT=0
APPROVED_COUNT=0
PENDING_COUNT=0
REJECTED_COUNT=0
AUTOMATION_COUNT=0
MISSING_FIELDS_COUNT=0

for report in "${REPORTS[@]}"; do
    REPORT_COUNT=$((REPORT_COUNT + 1))
    rel="${report#${REPO_ROOT}/}"
    result="$(extract_field "${report}" VERIFICATION_RESULT)"
    verified_by="$(extract_field "${report}" VERIFIED_BY)"
    verified_at="$(extract_field "${report}" VERIFIED_AT)"

    report_pass=true
    report_reasons=()

    if [ "${result}" = "pending" ]; then
        report_pass=false
        report_reasons+=("VERIFICATION_RESULT is 'pending' (must be 'approved')")
        PENDING_COUNT=$((PENDING_COUNT + 1))
    elif is_placeholder "${result}"; then
        report_pass=false
        report_reasons+=("VERIFICATION_RESULT is unfilled ('${result:-<missing>}')")
        MISSING_FIELDS_COUNT=$((MISSING_FIELDS_COUNT + 1))
    elif [ "${result}" = "rejected" ]; then
        report_pass=false
        report_reasons+=("VERIFICATION_RESULT is 'rejected' (must be 'approved')")
        REJECTED_COUNT=$((REJECTED_COUNT + 1))
    elif [ "${result}" != "approved" ]; then
        report_pass=false
        report_reasons+=("VERIFICATION_RESULT is '${result}' (must be 'approved')")
        MISSING_FIELDS_COUNT=$((MISSING_FIELDS_COUNT + 1))
    fi

    if is_automation_verifier "${verified_by}"; then
        report_pass=false
        report_reasons+=("VERIFIED_BY is automation/bot value ('${verified_by}') — self-approval rejected")
        AUTOMATION_COUNT=$((AUTOMATION_COUNT + 1))
    elif is_placeholder "${verified_by}"; then
        report_pass=false
        report_reasons+=("VERIFIED_BY is unfilled ('${verified_by:-<missing>}')")
        MISSING_FIELDS_COUNT=$((MISSING_FIELDS_COUNT + 1))
    fi

    if is_placeholder "${verified_at}"; then
        report_pass=false
        report_reasons+=("VERIFIED_AT is unfilled ('${verified_at:-<missing>}')")
        MISSING_FIELDS_COUNT=$((MISSING_FIELDS_COUNT + 1))
    fi

    if [ "${report_pass}" = "true" ]; then
        APPROVED_COUNT=$((APPROVED_COUNT + 1))
    else
        PASS=false
        for r in "${report_reasons[@]}"; do
            REASONS+=("${rel}: ${r}")
        done
    fi
done

# JSON output.
if [ "${JSON_MODE}" = "1" ]; then
    reasons_json="["
    first=1
    for r in "${REASONS[@]:-}"; do
        [ -z "${r}" ] && continue
        if [ "${first}" = "1" ]; then first=0; else reasons_json+=","; fi
        esc=$(printf '%s' "${r}" | sed 's/"/\\"/g')
        reasons_json+="\"${esc}\""
    done
    reasons_json+="]"
    printf '{"phase":"%s","reports_dir":"%s","reports_found":%d,"reports_approved":%d,"reports_pending":%d,"reports_rejected":%d,"reports_automation_self_approved":%d,"reports_missing_fields":%d,"pass":%s,"reasons":%s}\n' \
        "${PHASE_LABEL}" \
        "${REPORTS_DIR#${REPO_ROOT}/}" \
        "${REPORT_COUNT}" \
        "${APPROVED_COUNT}" \
        "${PENDING_COUNT}" \
        "${REJECTED_COUNT}" \
        "${AUTOMATION_COUNT}" \
        "${MISSING_FIELDS_COUNT}" \
        "$([ "${PASS}" = "true" ] && echo true || echo false)" \
        "${reasons_json}"
else
    echo "Verification Process Integrity Guard — ${PHASE_LABEL}"
    echo "============================================================"
    echo "Reports directory:      ${REPORTS_DIR#${REPO_ROOT}/}"
    echo "Reports found:          ${REPORT_COUNT}"
    echo "Reports approved:       ${APPROVED_COUNT}"
    echo "Reports pending:        ${PENDING_COUNT}"
    echo "Reports rejected:       ${REJECTED_COUNT}"
    echo "Automation self-approved: ${AUTOMATION_COUNT}"
    echo "Reports missing fields: ${MISSING_FIELDS_COUNT}"
    echo ""
    if [ "${PASS}" = "true" ]; then
        echo "PASS: All ${REPORT_COUNT} verification reports are approved by a non-automation verifier."
    else
        echo "FAIL: Process integrity violations detected in ${#REASONS[@]} report field(s)."
        echo ""
        echo "Open issues:"
        for r in "${REASONS[@]}"; do
            echo "  - ${r}"
        done
        echo ""
        echo "Green path:"
        echo "  1. Reset every phase verification report to VERIFICATION_RESULT: pending"
        echo "     and clear VERIFIED_BY / VERIFIED_AT."
        echo "  2. Have a human verifier drive measure/workflow.md Steps 1-10 for each phase."
        echo "  3. Update each report with VERIFICATION_RESULT: approved, a real name in"
        echo "     VERIFIED_BY, and an ISO-8601 timestamp in VERIFIED_AT."
    fi
fi

if [ "${PASS}" = "true" ]; then
    exit 0
fi
exit 1
