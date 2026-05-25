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
: "${PROJECT_ID:?PROJECT_ID manquant — lancez d'abord 02-create-project.sh}"
: "${BOOTSTRAP_JOHAN_PASSWORD:?Variable BOOTSTRAP_JOHAN_PASSWORD manquante}"
: "${BOOTSTRAP_CAROLINE_PASSWORD:?Variable BOOTSTRAP_CAROLINE_PASSWORD manquante}"

echo "[03] Authentification..."
TOKEN=$(curl -sf -X POST "$SYMFONY_API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$SYMFONY_SERVICE_EMAIL\",\"password\":\"$SYMFONY_SERVICE_PASSWORD\"}" \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "[03] ERREUR : authentification échouée"
  exit 1
fi
echo "[03] Authentifié ✓"

# Étape 1 : associer un utilisateur à l'organisation
add_org_member() {
  local email="$1"
  local password="$2"
  local org_role="$3"
  local label="$4"

  echo "[03] Org member $label ($email)..."
  PAYLOAD=$(cat <<JSON
{
  "email": "$email",
  "password": "$password",
  "role": "$org_role"
}
JSON
)

  RESPONSE=$(curl -sf -X POST "$SYMFONY_API_URL/api/organizations/$ORG_ID/members" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d "$PAYLOAD" \
    -w "\n%{http_code}" || true)

  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  BODY=$(echo "$RESPONSE" | head -n -1)

  if [ "$HTTP_CODE" = "409" ]; then
    echo "[03]   $label déjà membre de l'organisation — ignoré ✓"
  elif [ "$HTTP_CODE" = "201" ]; then
    echo "[03]   $label ajouté à l'organisation ✓"
  else
    echo "[03]   ERREUR HTTP $HTTP_CODE pour $label (org) : $BODY"
    exit 1
  fi
}

# Étape 2 : associer un utilisateur au projet
add_project_member() {
  local email="$1"
  local project_role="$2"
  local roles="$3"
  local label="$4"

  echo "[03] Project member $label ($email)..."
  PAYLOAD=$(cat <<JSON
{
  "email": "$email",
  "projectRole": "$project_role",
  "roles": $roles
}
JSON
)

  RESPONSE=$(curl -sf -X POST "$SYMFONY_API_URL/api/projects/$PROJECT_ID/members" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -d "$PAYLOAD" \
    -w "\n%{http_code}" || true)

  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  BODY=$(echo "$RESPONSE" | head -n -1)

  if [ "$HTTP_CODE" = "409" ] || [ "$HTTP_CODE" = "200" ]; then
    echo "[03]   $label déjà membre du projet — ignoré ✓"
  elif [ "$HTTP_CODE" = "201" ]; then
    echo "[03]   $label ajouté au projet ✓"
  else
    echo "[03]   ERREUR HTTP $HTTP_CODE pour $label (projet) : $BODY"
    exit 1
  fi
}

add_org_member \
  "johan.remy@graines-digitales.online" \
  "$BOOTSTRAP_JOHAN_PASSWORD" \
  "owner" \
  "Johan"

add_org_member \
  "buzac@mlk-my-little-kasbah.immo" \
  "$BOOTSTRAP_CAROLINE_PASSWORD" \
  "admin" \
  "Caroline"

add_project_member \
  "johan.remy@graines-digitales.online" \
  "owner" \
  '["ROLE_ADMIN"]' \
  "Johan"

add_project_member \
  "buzac@mlk-my-little-kasbah.immo" \
  "admin" \
  '["ROLE_USER"]' \
  "Caroline"

echo "[03] Utilisateurs ✓"
