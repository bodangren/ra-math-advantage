#!/usr/bin/env bash
# Phase 8 JSDoc Coverage Guard — Red baseline test for jsdoc-comments_20260526.
#
# Per measure/tracks/jsdoc-comments_20260526/test-strategy.md §1, this script is the
# "Graph delta checks" test tier (build-graph + summary count query). It is intentionally
# a shell guard, NOT a vitest file, because the strategy bans new vitest files for doc text.
#
# Lives under measure/tracks/<track>/scripts/ (Measure-owned test artifact, not an app
# script) to honor the Red-phase boundary: tests and Measure docs only, no application
# source paths modified.
#
# Asserts: zero functions in `packages/*/src/` have NULL summaries in graph.db.
# Exit 0 = pass (Phase 8 acceptance met). Non-zero = fail (functions still undocumented).
#
# This is the Phase 8 sibling of check-jsdoc-coverage.sh (Phase 1 BM2 lib/),
# check-jsdoc-coverage-components.sh (Phase 2 BM2 components/),
# check-jsdoc-coverage-remaining.sh (Phase 3 BM2 app/convex/scripts/other),
# check-jsdoc-coverage-convex-im3.sh (Phase 4 IM3 convex/),
# check-jsdoc-coverage-components-im3.sh (Phase 5 IM3 components/),
# check-jsdoc-coverage-im3-lib.sh (Phase 6 IM3 lib/), and
# check-jsdoc-coverage-im3-app.sh (Phase 7 IM3 app/scripts/other). Same SQL shape, different
# scope — kept as a separate file so the per-phase acceptance gate stays a single command
# and so the JSON output reports the right phase label.
#
# Scope rationale: Phase 8 covers every package's `src/` directory (20 packages: activity-
# components, activity-runtime, ai-tutoring, app-shell, component-approval, core-auth,
# core-convex, graphing-core, knowledge-space-core, knowledge-space-practice, lesson-
# renderer, math-content, practice-core, practice-test-engine, rate-limiter, srs-engine,
# study-hub-core, teacher-reporting-core, workbook-pipeline, plus `_template`). The
# test-strategy.md §3 "Re-exports / barrel files" pitfall applies: JSDoc on the re-export
# line in `packages/*/src/index.ts` is ignored by the graph; document at the source, not
# the barrel. The guard's SQL uses `file_path LIKE '%/packages/%/src/%'` which matches all
# 20 packages plus `_template` (single LIKE pattern keeps the scope-isolation invariant
# crisp and matches the per-directory Task 8.1 / 8.2 mental model).
#
# Usage:
#   bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-packages-src.sh
#   bash measure/tracks/jsdoc-comments_20260526/scripts/check-jsdoc-coverage-packages-src.sh --json
#
# Requires: build-graph on PATH, ./graph.db at repo root, packages/* files scanned.

set -euo pipefail

# Script lives at measure/tracks/jsdoc-comments_20260526/scripts/, so 4 levels up = repo root.
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
GRAPH_DB="${GRAPH_DB:-${REPO_ROOT}/graph.db}"
PHASE_LABEL="Phase 8 (Packages src/)"

# Build the single LIKE pattern covering every package's src/ directory.
# Using a single LIKE (rather than an OR over all 20 packages) keeps the scope-isolation
# invariant crisp and matches the per-directory Task 8.1 / 8.2 mental model. Excludes
# node_modules / .next / dist / __tests__ subdirs to honor test-strategy.md §3
# "Re-exports / barrel files" pitfall (barrel re-exports are documented at source, not
# in the barrel; test files are out of scope).
SCOPE_PATTERN="file_path LIKE '%/packages/%/src/%' AND file_path NOT LIKE '%/node_modules/%' AND file_path NOT LIKE '%/.next/%' AND file_path NOT LIKE '%/dist/%'"

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

QUERY_TOTAL="SELECT COUNT(*) FROM nodes WHERE type='function' AND ${SCOPE_PATTERN}"
QUERY_NULL="SELECT COUNT(*) FROM nodes WHERE type='function' AND ${SCOPE_PATTERN} AND summary IS NULL"
QUERY_EXPORTED_NULL="SELECT COUNT(*) FROM nodes WHERE type='function' AND ${SCOPE_PATTERN} AND tags LIKE '%exported%' AND summary IS NULL"
QUERY_INTERNAL_NULL="SELECT COUNT(*) FROM nodes WHERE type='function' AND ${SCOPE_PATTERN} AND (tags NOT LIKE '%exported%' OR tags IS NULL) AND summary IS NULL"
# Per-package breakdown for the human-readable output (matches the table in phase-8-red-baseline.md).
QUERY_PER_PKG_NULL="SELECT package_id, COUNT(*) AS n FROM nodes WHERE type='function' AND ${SCOPE_PATTERN} AND summary IS NULL GROUP BY package_id ORDER BY n DESC"

extract_count() {
    build-graph query "${GRAPH_DB}" "$1" 2>/dev/null | tail -n 1 | tr -d ' '
}

TOTAL="$(extract_count "${QUERY_TOTAL}")"
NULL_TOTAL="$(extract_count "${QUERY_NULL}")"
NULL_EXPORTED="$(extract_count "${QUERY_EXPORTED_NULL}")"
NULL_INTERNAL="$(extract_count "${QUERY_INTERNAL_NULL}")"

if [ "${JSON_MODE}" = "1" ]; then
    cat <<EOF
{"phase":"${PHASE_LABEL}","scope":"packages/*/src/","total_functions":${TOTAL},"null_summary_total":${NULL_TOTAL},"null_summary_exported":${NULL_EXPORTED},"null_summary_internal":${NULL_INTERNAL},"pass":$([ "${NULL_TOTAL}" = "0" ] && echo true || echo false)}
EOF
else
    echo "JSDoc Coverage Guard — ${PHASE_LABEL}"
    echo "==========================================="
    echo "Scope:                    packages/*/src/ (20 packages)"
    echo "Total functions:          ${TOTAL}"
    echo "NULL summaries (total):   ${NULL_TOTAL}"
    echo "  - exported:             ${NULL_EXPORTED}  (Task 8.1 target)"
    echo "  - internal:             ${NULL_INTERNAL}  (Task 8.2 target)"
    echo ""
fi

if [ "${NULL_TOTAL}" = "0" ]; then
    [ "${JSON_MODE}" = "0" ] && echo "PASS: All ${TOTAL} functions in Phase 8 scope have JSDoc summaries."
    exit 0
fi

if [ "${JSON_MODE}" = "0" ]; then
    echo "FAIL: ${NULL_TOTAL} function(s) in Phase 8 scope still missing JSDoc summaries."
    echo ""
    echo "Per measure/tracks/jsdoc-comments_20260526/spec.md FR-1/FR-2, every exported AND internal"
    echo "function in scope must have a JSDoc block (summary, @param, @returns, @throws if applicable)."
    echo ""
    echo "Per-package NULL breakdown:"
    build-graph query "${GRAPH_DB}" \
        "${QUERY_PER_PKG_NULL}" 2>/dev/null || true
    echo ""
    echo "Reproduce manually:"
    echo "  build-graph query ./graph.db \"${QUERY_NULL}\""
    echo ""
    echo "Refresh graph after edits:"
    echo "  build-graph scan . ./graph.db"
fi
exit 1
