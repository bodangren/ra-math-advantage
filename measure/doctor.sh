#!/usr/bin/env bash
# measure/doctor.sh — Convenience shim that delegates to the canonical
# doctor script at measure/scripts/doctor.sh. The canonical location was
# relocated during the measure-architecture-tooling_20260605 work, but
# `bash measure/doctor.sh` remains the documented gate command and the
# automation supervisor (measure/automation-supervisor.py) still calls
# ./measure/doctor.sh, so this shim keeps both invocations working.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec "$SCRIPT_DIR/scripts/doctor.sh" "$@"