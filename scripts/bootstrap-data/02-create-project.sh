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
: "${ORG_ID:?ORG_ID manquant — lancez d'abord 01-create-org.sh}"

echo "[02] Authentification..."
TOKEN=$(curl -sf -X POST "$SYMFONY_API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$SYMFONY_SERVICE_EMAIL\",\"password\":\"$SYMFONY_SERVICE_PASSWORD\"}" \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "[02] ERREUR : authentification échouée"
  exit 1
fi
echo "[02] Authentifié ✓"

echo "[02] Création du projet..."
PAYLOAD=$(cat <<JSON
{
  "organization": "/api/organizations/$ORG_ID",
  "name": "MLK - Modern Site Web",
  "sourceLocale": "fr",
  "enabledLocales": ["fr", "en"]
}
JSON
)

RESPONSE=$(curl -sf -X POST "$SYMFONY_API_URL/api/projects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "$PAYLOAD" \
  -w "\n%{http_code}" || true)

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "409" ]; then
  echo "[02] Projet déjà existant — récupération de l'ID..."
  BODY=$(curl -sf "$SYMFONY_API_URL/api/projects" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Accept: application/json")
  PROJECT_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
elif [ "$HTTP_CODE" = "201" ]; then
  PROJECT_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
else
  echo "[02] ERREUR HTTP $HTTP_CODE : $BODY"
  exit 1
fi

if [ -z "$PROJECT_ID" ]; then
  echo "[02] ERREUR : impossible d'extraire le PROJECT_ID"
  exit 1
fi

# Persist state
grep -v "^PROJECT_ID=" "$STATE_FILE" > "$STATE_FILE.tmp" 2>/dev/null || true
echo "PROJECT_ID=$PROJECT_ID" >> "$STATE_FILE.tmp"
mv "$STATE_FILE.tmp" "$STATE_FILE"

echo "[02] Projet ✓  PROJECT_ID=$PROJECT_ID"
