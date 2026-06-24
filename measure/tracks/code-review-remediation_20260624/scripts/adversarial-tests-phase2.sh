#!/usr/bin/env bash
# Adversarial test runner for Phase 2 (Cluster B — production-wiring scope
# & dead work). Runs the four adversarial probes in
# `apps/integrated-math-3/__tests__/convex/studentVisualizationAdversarial.test.ts`
# plus a separate `npx tsc --noEmit` assignability check on the narrow-union
# fixture.
#
# Probes:
#   1. Unknown nodeId (vitest: PROBE 1)
#   2. Single-module payload (vitest: PROBE 2)
#   3. Architecture-lint regex robustness (vitest: PROBE 3 — all five
#      shapes; the brief's specific case is the "await import full-path"
#      assertion, which is the hard contract)
#   4. TSC assignability (separate `tsc --noEmit` invocation against
#      `_fixtures/adversarial-tsc-narrow-check.ts`; the vitest PROBE 4
#      is a smoke check for fixture presence only)
#
# Exit codes:
#   0 = all probes pass their expected verdict
#   1 = at least one probe failed (behavioural regression, lint evasion,
#       or tsc assignability break)
#   2 = runner-plumbing error (missing test file, missing fixture,
#       tsc binary not found, etc.)
#
# Usage:
#   bash measure/tracks/code-review-remediation_20260624/scripts/adversarial-tests-phase2.sh
#
# Output:
#   measure/tracks/code-review-remediation_20260624/_artifacts/adversarial-run-phase2.txt
#   (full transcript of vitest + tsc + verdict table)

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
TRACK_DIR="${REPO_ROOT}/measure/tracks/code-review-remediation_20260624"
ARTIFACTS_DIR="${TRACK_DIR}/_artifacts"
SCRIPT_LOG="${ARTIFACTS_DIR}/adversarial-run-phase2.txt"
TEST_FILE="apps/integrated-math-3/__tests__/convex/studentVisualizationAdversarial.test.ts"
TSC_FIXTURE="apps/integrated-math-3/__tests__/convex/_fixtures/adversarial-tsc-narrow-check.ts"

mkdir -p "${ARTIFACTS_DIR}"

# --- Plumbing checks ---------------------------------------------------------

if [ ! -f "${REPO_ROOT}/${TEST_FILE}" ]; then
  echo "ERROR: test file not found: ${TEST_FILE}" >&2
  exit 2
fi
if [ ! -f "${REPO_ROOT}/${TSC_FIXTURE}" ]; then
  echo "ERROR: tsc fixture not found: ${TSC_FIXTURE}" >&2
  exit 2
fi

# --- Run vitest + tsc; capture transcript to a temp log -----------------------

VITEST_TMP="$(mktemp)"
TSC_TMP="$(mktemp)"
trap 'rm -f "${VITEST_TMP}" "${TSC_TMP}"' EXIT

echo "==============================================="
echo "Phase 2 Adversarial Test Runner"
echo "Repo root: ${REPO_ROOT}"
echo "Test file: ${TEST_FILE}"
echo "TSC fixture: ${TSC_FIXTURE}"
echo "==============================================="
echo ""

# 1) vitest on the adversarial file (probes 1, 2, 3, 4-smoke).
echo "[step 1/2] vitest on adversarial test file..."
(
  cd "${REPO_ROOT}" && \
  npm run --workspace=apps/integrated-math-3 test -- --run \
    "studentVisualizationAdversarial" 2>&1
) | tee "${VITEST_TMP}"
VITEST_EXIT=${PIPESTATUS[0]}

echo ""
echo "vitest exit: ${VITEST_EXIT}"
echo ""

# 2) tsc --noEmit on apps/integrated-math-3 (catches assignability break
#    in the narrow-union fixture).
echo "[step 2/2] tsc --noEmit on apps/integrated-math-3..."
(
  cd "${REPO_ROOT}/apps/integrated-math-3" && \
  npx tsc --noEmit 2>&1
) > "${TSC_TMP}" || true
TSC_EXIT=$?
echo "tsc captured to temp log; full output stored in run log"

# --- Parse tsc output for fixture-specific errors ----------------------------

TSC_FIXTURE_BASENAME="$(basename "${TSC_FIXTURE}")"
TSC_FIXTURE_ERRORS="$(grep -E "${TSC_FIXTURE_BASENAME}" "${TSC_TMP}" || true)"
TSC_FIXTURE_ERROR_COUNT=0
if [ -n "${TSC_FIXTURE_ERRORS}" ]; then
  TSC_FIXTURE_ERROR_COUNT="$(printf '%s\n' "${TSC_FIXTURE_ERRORS}" | wc -l | tr -d ' ')"
fi

# --- Build verdict table -----------------------------------------------------

# Parse vitest output for the four probe outcomes. We strip ANSI
# escape codes first (vitest uses them for color), then look for the
# "Tests" summary and per-test pass/fail.
VITEST_CLEAN="$(sed -E $'s/\x1b\\[[0-9;]*[a-zA-Z]//g' "${VITEST_TMP}")"
# vitest prints "Test Files X passed (Y)" THEN "Tests N passed (N)".
# Take the LAST match (which corresponds to the per-test summary, not
# the file summary).
VITEST_PASS_COUNT="$(printf '%s\n' "${VITEST_CLEAN}" | grep -oE '[0-9]+ passed' | tail -1 | grep -oE '[0-9]+' || echo 0)"
VITEST_FAIL_COUNT="$(printf '%s\n' "${VITEST_CLEAN}" | grep -oE '[0-9]+ failed' | tail -1 | grep -oE '[0-9]+' || echo 0)"
# vitest "Tests" line: e.g. "      Tests  9 passed (9)" — we capture
# the inner-of-parentheses total (the count in parens), which matches
# the run-config's expectations.
VITEST_TOTAL="$(printf '%s\n' "${VITEST_CLEAN}" | grep -oE 'Tests +[0-9]+ +passed +\([0-9]+\)' | tail -1 | grep -oE '\([0-9]+\)' | grep -oE '[0-9]+' || echo unknown)"

# Per-probe verdict (best-effort — we check the test summary, not individual
# test names, because vitest's output format is stable at the summary level).
PROBE_1_VERDICT="UNKNOWN"
PROBE_2_VERDICT="UNKNOWN"
PROBE_3_VERDICT="UNKNOWN"
PROBE_4_SMOKE_VERDICT="UNKNOWN"
TSC_ASSIGN_VERDICT="UNKNOWN"

if [ "${VITEST_EXIT}" = "0" ] && [ "${VITEST_FAIL_COUNT}" = "0" ]; then
  PROBE_1_VERDICT="PASS"
  PROBE_2_VERDICT="PASS"
  PROBE_3_VERDICT="PASS"
  PROBE_4_SMOKE_VERDICT="PASS"
elif [ "${VITEST_EXIT}" != "0" ]; then
  # Mark all as FAIL; the runner captures the failing-test name in the log.
  PROBE_1_VERDICT="FAIL"
  PROBE_2_VERDICT="FAIL"
  PROBE_3_VERDICT="FAIL"
  PROBE_4_SMOKE_VERDICT="FAIL"
fi

if [ "${TSC_FIXTURE_ERROR_COUNT}" = "0" ]; then
  TSC_ASSIGN_VERDICT="PASS"
else
  TSC_ASSIGN_VERDICT="FAIL"
fi

# --- Verdict table -----------------------------------------------------------

cat <<HEADER

===============================================
Adversarial Verdict Table — Phase 2 (Cluster B)
===============================================
Probe                                          Verdict
---------------------------------------------  --------
PROBE 1: Unknown nodeId (silently dropped)     ${PROBE_1_VERDICT}
PROBE 2: Single-module parent payload          ${PROBE_2_VERDICT}
PROBE 3: Arch-lint regex (await import full)   ${PROBE_3_VERDICT}
PROBE 4: TSC assignability (narrow → broad)    ${TSC_ASSIGN_VERDICT}
---------------------------------------------  --------
vitest: ${VITEST_TOTAL} tests, ${VITEST_PASS_COUNT} passed, ${VITEST_FAIL_COUNT} failed (exit ${VITEST_EXIT})
tsc:    ${TSC_FIXTURE_ERROR_COUNT} errors in ${TSC_FIXTURE_BASENAME}
===============================================

HEADER

# --- Findings (machine-readable, for the audit JSON) -------------------------

echo "Findings:"
if [ "${PROBE_3_VERDICT}" = "FAIL" ]; then
  echo "  - PROBE 3 FAIL: the arch-lint regex failed to detect at least one of the import shapes. See vitest log for the failing test name."
fi
if [ "${TSC_ASSIGN_VERDICT}" = "FAIL" ]; then
  echo "  - TSC FAIL: the narrow union is not assignable to projectStudentVisualization's wider union. See tsc log lines containing '${TSC_FIXTURE_BASENAME}'."
  echo "    This means FR-6's narrowing introduced a tsc regression. Inspect the tsc output for the exact error code (likely TS2322 or TS2345)."
fi
if [ "${PROBE_1_VERDICT}" = "FAIL" ]; then
  echo "  - PROBE 1 FAIL: unknown nodeId handling regressed. Either the projection now throws on unknown ids, or the known id is missing from output. See vitest log."
fi
if [ "${PROBE_2_VERDICT}" = "FAIL" ]; then
  echo "  - PROBE 2 FAIL: single-module parent payload is no longer schema-valid. See vitest log."
fi
if [ "${PROBE_3_VERDICT}" = "PASS" ] && [ "${TSC_ASSIGN_VERDICT}" = "PASS" ] && [ "${PROBE_1_VERDICT}" = "PASS" ] && [ "${PROBE_2_VERDICT}" = "PASS" ]; then
  echo "  (none — all four probes passed)"
fi

# --- Persist the full transcript ---------------------------------------------

{
  echo "==============================================="
  echo "Phase 2 Adversarial Test Runner — Full Transcript"
  echo "Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "Repo: ${REPO_ROOT}"
  echo "Head: $(git -C "${REPO_ROOT}" rev-parse HEAD)"
  echo "==============================================="
  echo ""
  echo "------ vitest output ------"
  cat "${VITEST_TMP}"
  echo ""
  echo "------ tsc --noEmit output (apps/integrated-math-3) ------"
  cat "${TSC_TMP}"
  echo ""
  echo "------ tsc errors specific to ${TSC_FIXTURE_BASENAME} ------"
  if [ -n "${TSC_FIXTURE_ERRORS}" ]; then
    printf '%s\n' "${TSC_FIXTURE_ERRORS}"
  else
    echo "(none — assignability holds)"
  fi
  echo ""
  echo "------ Verdict table ------"
  echo "PROBE 1 (unknown nodeId):              ${PROBE_1_VERDICT}"
  echo "PROBE 2 (single-module payload):       ${PROBE_2_VERDICT}"
  echo "PROBE 3 (arch-lint regex):             ${PROBE_3_VERDICT}"
  echo "PROBE 4 (tsc assignability, broad):    ${TSC_ASSIGN_VERDICT}"
  echo "vitest: ${VITEST_TOTAL} tests, ${VITEST_PASS_COUNT} passed, ${VITEST_FAIL_COUNT} failed (exit ${VITEST_EXIT})"
  echo "tsc:    ${TSC_FIXTURE_ERROR_COUNT} errors specific to ${TSC_FIXTURE_BASENAME}"
} > "${SCRIPT_LOG}"

echo ""
echo "Transcript written to: ${SCRIPT_LOG}"

# --- Exit code ---------------------------------------------------------------

if [ "${VITEST_EXIT}" != "0" ] || [ "${TSC_FIXTURE_ERROR_COUNT}" != "0" ]; then
  exit 1
fi
exit 0
