#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
STATE_FILE="$SCRIPT_DIR/.state"
YAML_FILE="$ROOT_DIR/content/fr/category-code.yaml"

# shellcheck source=/dev/null
[ -f "$ROOT_DIR/.env" ] && source "$ROOT_DIR/.env"
[ -f "$STATE_FILE" ] && source "$STATE_FILE"

: "${SYMFONY_API_URL:?Variable SYMFONY_API_URL manquante}"
: "${SYMFONY_SERVICE_EMAIL:?Variable SYMFONY_SERVICE_EMAIL manquante}"
: "${SYMFONY_SERVICE_PASSWORD:?Variable SYMFONY_SERVICE_PASSWORD manquante}"
: "${PROJECT_ID:?PROJECT_ID manquant — lancez d'abord 02-create-project.sh}"

if ! command -v yq &>/dev/null; then
  echo "[04] ERREUR : yq non trouvé. Installez-le : https://github.com/mikefarah/yq"
  exit 1
fi

echo "[04] Authentification..."
TOKEN=$(curl -sf -X POST "$SYMFONY_API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$SYMFONY_SERVICE_EMAIL\",\"password\":\"$SYMFONY_SERVICE_PASSWORD\"}" \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "[04] ERREUR : authentification échouée"
  exit 1
fi
echo "[04] Authentifié ✓"

created=0
skipped=0
errors=0

COUNT=$(yq '.items | length' "$YAML_FILE")

for i in $(seq 0 $((COUNT - 1))); do
  code=$(yq ".items[$i].codeValue" "$YAML_FILE")
  label=$(yq ".items[$i].name" "$YAML_FILE")
  in_code_set=$(yq ".items[$i].inCodeSet" "$YAML_FILE")

  PAYLOAD=$(yq -o=json -n \
    --arg code "$code" \
    --arg label "$label" \
    --arg inCodeSet "$in_code_set" \
    '{"code": $code, "inCodeSet": $inCodeSet, "label": $label}')

  RESPONSE=$(curl -sf -X POST "$SYMFONY_API_URL/api/projects/$PROJECT_ID/category-codes" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d "$PAYLOAD" \
    -w "\n%{http_code}" || true)

  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  BODY=$(echo "$RESPONSE" | head -n -1)

  if [ "$HTTP_CODE" = "201" ]; then
    echo "  ✓ $in_code_set / $code"
    created=$((created + 1))
  elif [ "$HTTP_CODE" = "409" ] || [ "$HTTP_CODE" = "422" ]; then
    echo "  ~ $in_code_set / $code (déjà existant)"
    skipped=$((skipped + 1))
  else
    echo "  ✗ $in_code_set / $code — HTTP $HTTP_CODE : $BODY"
    errors=$((errors + 1))
  fi
done

echo "[04] CategoryCodes — créés: $created, déjà existants: $skipped, erreurs: $errors"
[ "$errors" -gt 0 ] && exit 1 || true
