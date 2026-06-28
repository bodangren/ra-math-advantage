#!/usr/bin/env bash
# Adversarial test runner for the FR-3 balanced-brace JSDoc guard.
#
# Per task brief: each scenario in scripts/fixtures/adversarial/ is run
# against check-jsdoc-balanced-braces.sh. The runner records the guard's
# exit code and the violation class it reported (if any), then compares
# against the expected verdict declared in the table below.
#
# Exit codes:
#   0 = all scenarios match their expected verdict
#   1 = at least one scenario failed (bypass or false positive)
#   2 = runner-plumbing error (fixture missing, guard missing, etc.)
#
# This script does NOT modify the guard. If a bypass is found, the
# adversarial audit documents it and the fix is landed as a separate
# (jr-green) commit.

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
SCRIPTS_DIR="${REPO_ROOT}/measure/tracks/code-review-remediation_20260624/scripts"
FIXTURES_DIR="${SCRIPTS_DIR}/fixtures"
ADV_DIR="${FIXTURES_DIR}/adversarial"
GUARD="${SCRIPTS_DIR}/check-jsdoc-balanced-braces.sh"
ARTIFACTS_DIR="${REPO_ROOT}/measure/tracks/code-review-remediation_20260624/_artifacts"

mkdir -p "${ARTIFACTS_DIR}"

if [ ! -x "${GUARD}" ]; then
    echo "ERROR: guard not found or not executable: ${GUARD}" >&2
    exit 2
fi

if [ ! -d "${ADV_DIR}" ]; then
    echo "ERROR: adversarial fixtures dir not found: ${ADV_DIR}" >&2
    exit 2
fi

# --- Scenario table ---
# Format: fixture_basename|expected_violation_class|expected_exit|verdict_note
# expected_violation_class is one of: UNBALANCED, UNBALANCED_PARENS, STRAY_BLOCK, PASS
SCENARIOS=(
    "adv-01-multiline-param.ts|UNBALANCED|1|Multi-line @param — first line's brace region never closes on the same line."
    "adv-02-multiline-returns.ts|UNBALANCED|1|Multi-line @returns — first line's brace region never closes on the same line."
    "adv-03-embedded-braces-prose.ts|STRAY_BLOCK|1|Orphaned {} block after prose — guard's STRAY_BLOCK check only inspects the first non-space char after the type region, so this is a documented bypass."
    "adv-04-nested-template-literal.ts|PASS|0|Backtick template literal inside @param type — guard sees depth=0, reports balanced. JSDoc-spec-invalid but syntactically balanced; documented limitation."
    "adv-05-comment-in-braces.ts|PASS|0|JSDoc-style comment inside brace region — all braces balance, guard passes."
    "adv-06-trailing-comma-object.ts|PASS|0|Trailing semicolon in object type — guard passes."
    "adv-07-generic-default.ts|PASS|0|TypeScript generic with default — guard passes."
    "adv-08-tagged-template-type.ts|PASS|0|Nested ReturnType<typeof fetch> — guard passes."
    "adv-09-tuple-type.ts|PASS|0|Tuple type [string, number] — guard passes."
    "adv-10-function-overload-union.ts|PASS|0|Union of two function types — guard passes."
)

PASS_COUNT=0
FAIL_COUNT=0
RESULTS=()

echo "==============================================="
echo "FR-3 Adversarial Test Runner"
echo "Guard: ${GUARD}"
echo "Fixtures: ${ADV_DIR}"
echo "==============================================="
echo ""

for scenario in "${SCENARIOS[@]}"; do
    IFS='|' read -r fixture expected_class expected_exit note <<< "${scenario}"
    fixture_path="${ADV_DIR}/${fixture}"

    if [ ! -f "${fixture_path}" ]; then
        echo "  [RUNNER-ERROR] fixture missing: ${fixture}" >&2
        FAIL_COUNT=$((FAIL_COUNT + 1))
        RESULTS+=("ERROR|${fixture}|missing")
        continue
    fi

    # Run the guard, capture stdout and exit code
    guard_output=$(bash "${GUARD}" "${fixture_path}" 2>&1)
    guard_exit=$?

    # Extract the violation class from the guard output.
    # The guard prints lines like: "<path>: <CLASS> — <line>"
    # When clean, the output has "Violations: 0" and "PASS:".
    observed_class="PASS"
    if [ "${guard_exit}" -ne 0 ]; then
        # Pull the first violation class token (before the " — " separator)
        observed_class=$(echo "${guard_output}" | grep -E '^\s*[^[:space:]].*:[[:space:]]+(UNBALANCED|UNBALANCED_PARENS|STRAY_BLOCK)' | head -1 | sed -E 's/.*:[[:space:]]+(UNBALANCED|UNBALANCED_PARENS|STRAY_BLOCK).*/\1/')
        if [ -z "${observed_class}" ]; then
            observed_class="UNKNOWN"
        fi
    fi

    # Compare against expected
    if [ "${observed_class}" = "${expected_class}" ] && [ "${guard_exit}" = "${expected_exit}" ]; then
        verdict="PASS"
        PASS_COUNT=$((PASS_COUNT + 1))
    else
        verdict="FAIL"
        FAIL_COUNT=$((FAIL_COUNT + 1))
    fi

    printf "  [%s] %s\n" "${verdict}" "${fixture}"
    printf "         expected: %s (exit %s)\n" "${expected_class}" "${expected_exit}"
    printf "         observed: %s (exit %s)\n" "${observed_class}" "${guard_exit}"
    printf "         note:     %s\n" "${note}"
    echo ""

    RESULTS+=("${verdict}|${fixture}|${expected_class}|${guard_exit}|${observed_class}")
done

echo "==============================================="
echo "Adversarial summary: ${PASS_COUNT} pass, ${FAIL_COUNT} fail (of ${#SCENARIOS[@]} scenarios)"
echo "==============================================="

if [ "${FAIL_COUNT}" -eq 0 ]; then
    exit 0
else
    exit 1
fi
