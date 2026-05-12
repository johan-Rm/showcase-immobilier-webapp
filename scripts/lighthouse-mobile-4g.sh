#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

URL="${1:-http://localhost:3001/fr}"
OUT="${2:-./lighthouse.mobile-4g.json}"

exec "${SCRIPT_DIR}/lighthouse-mobile.sh" "${URL}" "${OUT}"
