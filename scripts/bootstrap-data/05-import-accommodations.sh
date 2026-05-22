#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
STATE_FILE="$SCRIPT_DIR/.state"

# shellcheck source=/dev/null
[ -f "$ROOT_DIR/.env" ] && source "$ROOT_DIR/.env"
[ -f "$STATE_FILE" ] && source "$STATE_FILE"

: "${SYMFONY_API_URL:?Variable SYMFONY_API_URL manquante}"
: "${SYMFONY_SERVICE_EMAIL:?Variable SYMFONY_SERVICE_EMAIL manquante}"
: "${SYMFONY_SERVICE_PASSWORD:?Variable SYMFONY_SERVICE_PASSWORD manquante}"
: "${PROJECT_ID:?PROJECT_ID manquant — lancez d'abord 02-create-project.sh}"

if ! command -v bun &>/dev/null; then
  echo "[05] ERREUR : bun non trouvé"
  exit 1
fi

echo "[05] Import des biens réels..."
cd "$ROOT_DIR"
SYMFONY_PROJECT_ID="$PROJECT_ID" bun scripts/import-accommodations.ts

echo "[05] Import accommodations ✓"
