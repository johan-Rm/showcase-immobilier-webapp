#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
STATE_FILE="$SCRIPT_DIR/.state"

# shellcheck source=/dev/null
[ -f "$ROOT_DIR/.env" ] && source "$ROOT_DIR/.env"

: "${SYMFONY_API_URL:?Variable SYMFONY_API_URL manquante}"
: "${SYMFONY_SERVICE_EMAIL:?Variable SYMFONY_SERVICE_EMAIL manquante}"
: "${SYMFONY_SERVICE_PASSWORD:?Variable SYMFONY_SERVICE_PASSWORD manquante}"

echo "[01] Authentification..."
TOKEN=$(curl -sf -X POST "$SYMFONY_API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$SYMFONY_SERVICE_EMAIL\",\"password\":\"$SYMFONY_SERVICE_PASSWORD\"}" \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "[01] ERREUR : authentification échouée"
  exit 1
fi
echo "[01] Authentifié ✓"

echo "[01] Récupération de l'organisation..."
BODY=$(curl -sf "$SYMFONY_API_URL/api/organizations" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json")

ORG_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$ORG_ID" ]; then
  echo "[01] ERREUR : aucune organisation trouvée"
  exit 1
fi

# Persist state
touch "$STATE_FILE"
grep -v "^ORG_ID=" "$STATE_FILE" > "$STATE_FILE.tmp" 2>/dev/null || true
echo "ORG_ID=$ORG_ID" >> "$STATE_FILE.tmp"
mv "$STATE_FILE.tmp" "$STATE_FILE"

echo "[01] Organisation ✓  ORG_ID=$ORG_ID"
