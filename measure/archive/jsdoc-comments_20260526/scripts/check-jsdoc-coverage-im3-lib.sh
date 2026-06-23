#!/usr/bin/env bash
# Phase 6 JSDoc Coverage Guard — Red baseline test for jsdoc-comments_20260526.
#
# Per measure/tracks/jsdoc-comments_20260526/test-strategy.md §1, this script is the
# "Graph delta checks" test tier (build-graph + summary count query). It is intentionally
# a shell guard, NOT a vitest file, because the strategy bans new vitest files for doc text.
#
# Lives under measure/tracks/<track>/scripts/ (Measure-owned test artifact, not an app
# script) to honor the Red-phase boundary: tests and Measure docs only, no application
# source paths modified.
#
# Asserts: zero functions in apps/integrated-math-3/lib/** have NULL summaries in graph.db.
# Exit 0 = pass (Phase 6 acceptance met). Non-zero = fail (functions still undocumented).
#
# This is the Phase 6 IM3 lib/ sibling of check-jsdoc-coverage.sh (Phase 1 BM2 lib/),
# check-jsdoc-coverage-components.sh (Phase 2 BM2 components/),
# check-jsdoc-coverage-components-im3.sh (Phase 5 IM3 components/), and
# check-jsdoc-coverage-remaining.sh (Phase 3 BM2 app/convex/scripts/other). Same SQL shape,
# different scope — kept as a separate file so the per-phase acceptance gate stays a single
# command and so the JSON output reports the right phase label.
#
# Phase 6 scope is intentionally narrow: apps/integrated-math-3/lib/**. It does NOT include
# apps/integrated-math-3/components/, apps/integrated-math-3/convex/, or
# apps/integrated-math-3/app/ — those are covered by Phases 5, 4, and 7 respectively.
# Phases are workspace-scoped per test-strategy.md §3 ("Phase dependency: Phases are
# workspace-scoped; failure in one phase does not block another.").
#
# Note: `apps/integrated-math-3/lib/convex/server.ts` IS in Phase 6 scope (it lives under
# the app's `lib/` directory, NOT under the monorepo-root `convex/` package). build-graph
# correctly tags every node in this directory with `package_id='integrated-math-3'`, so
# the scope filter is unambiguous.
#
# Usage:
#   bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-im3-lib.sh
#   bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-im3-lib.sh --json
#
# Requires: build-graph on PATH, ./graph.db at repo root, IM3 lib/ files scanned.

set -euo pipefail

# Script lives at measure/tracks/jsdoc-comments_20260526/scripts/, so 4 levels up = repo root.
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
GRAPH_DB="${GRAPH_DB:-${REPO_ROOT}/graph.db}"
SCOPE_PATTERN="%/apps/integrated-math-3/lib/%"
SCOPE_LABEL="apps/integrated-math-3/lib/"
PHASE_LABEL="Phase 6 (IM3 lib/)"

if ! command -v build-graph >/dev/null 2>&1; then
    echo "ERROR: build-graph not on PATH. Install per measure/lessons-learned.md or skip per Graph-Aware Mode rules." >&2
    exit 3
fi

if [ ! -f "${GRAPH_DB}" ]; then
    echo "ERROR: graph.db not found at ${GRAPH_DB}. Run 'build-graph scan ${REPO_ROOT} ${GRAPH_DB}' first." >&2
    exit 3
fi

JSON_MODE=0
if [ "${1:-}" = "--json" ]; then
    JSON_MODE=1
fi

QUERY_TOTAL="SELECT COUNT(*) FROM nodes WHERE type='function' AND file_path LIKE '${SCOPE_PATTERN}'"
QUERY_NULL="SELECT COUNT(*) FROM nodes WHERE type='function' AND file_path LIKE '${SCOPE_PATTERN}' AND summary IS NULL"
QUERY_EXPORTED_NULL="SELECT COUNT(*) FROM nodes WHERE type='function' AND file_path LIKE '${SCOPE_PATTERN}' AND tags LIKE '%exported%' AND summary IS NULL"
QUERY_INTERNAL_NULL="SELECT COUNT(*) FROM nodes WHERE type='function' AND file_path LIKE '${SCOPE_PATTERN}' AND (tags NOT LIKE '%exported%' OR tags IS NULL) AND summary IS NULL"
QUERY_PER_FILE_NULL="SELECT file_path, COUNT(*) AS n FROM nodes WHERE type='function' AND file_path LIKE '${SCOPE_PATTERN}' AND summary IS NULL GROUP BY file_path ORDER BY n DESC"

extract_count() {
    build-graph query "${GRAPH_DB}" "$1" 2>/dev/null | tail -n 1 | tr -d ' '
}

TOTAL="$(extract_count "${QUERY_TOTAL}")"
NULL_TOTAL="$(extract_count "${QUERY_NULL}")"
NULL_EXPORTED="$(extract_count "${QUERY_EXPORTED_NULL}")"
NULL_INTERNAL="$(extract_count "${QUERY_INTERNAL_NULL}")"

if [ "${JSON_MODE}" = "1" ]; then
    cat <<EOF
{"phase":"${PHASE_LABEL}","scope":"${SCOPE_LABEL}","total_functions":${TOTAL},"null_summary_total":${NULL_TOTAL},"null_summary_exported":${NULL_EXPORTED},"null_summary_internal":${NULL_INTERNAL},"pass":$([ "${NULL_TOTAL}" = "0" ] && echo true || echo false)}
EOF
else
    echo "JSDoc Coverage Guard — ${PHASE_LABEL}"
    echo "==========================================="
    echo "Scope:                    ${SCOPE_LABEL}"
    echo "Total functions:          ${TOTAL}"
    echo "NULL summaries (total):   ${NULL_TOTAL}"
    echo "  - exported:             ${NULL_EXPORTED}  (Task 6.1 target)"
    echo "  - internal:             ${NULL_INTERNAL}  (Task 6.2 target)"
    echo ""
fi

if [ "${NULL_TOTAL}" = "0" ]; then
    [ "${JSON_MODE}" = "0" ] && echo "PASS: All ${TOTAL} functions in ${SCOPE_LABEL} have JSDoc summaries."
    exit 0
fi

if [ "${JSON_MODE}" = "0" ]; then
    echo "FAIL: ${NULL_TOTAL} function(s) in ${SCOPE_LABEL} still missing JSDoc summaries."
    echo ""
    echo "Per measure/tracks/jsdoc-comments_20260526/spec.md FR-1/FR-2, every exported AND internal"
    echo "function in scope must have a JSDoc block (summary, @param, @returns, @throws if applicable)."
    echo ""
    echo "Per-file breakdown (top 25 NULL files):"
    build-graph query "${GRAPH_DB}" \
        "${QUERY_PER_FILE_NULL} LIMIT 25" 2>/dev/null || true
    echo ""
    echo "Reproduce manually:"
    echo "  build-graph query ./graph.db \"${QUERY_NULL}\""
    echo ""
    echo "Refresh graph after edits:"
    echo "  build-graph scan . ./graph.db"
fi
exit 1
