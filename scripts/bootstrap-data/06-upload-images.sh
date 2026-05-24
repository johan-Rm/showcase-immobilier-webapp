#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
STATE_FILE="$SCRIPT_DIR/.state"
IMAGES_DIR="$ROOT_DIR/public/images"
BATCH_SIZE=20

# shellcheck source=/dev/null
[ -f "$ROOT_DIR/.env" ] && source "$ROOT_DIR/.env"
[ -f "$STATE_FILE" ] && source "$STATE_FILE"

: "${SYMFONY_API_URL:?Variable SYMFONY_API_URL manquante}"
: "${SYMFONY_SERVICE_EMAIL:?Variable SYMFONY_SERVICE_EMAIL manquante}"
: "${SYMFONY_SERVICE_PASSWORD:?Variable SYMFONY_SERVICE_PASSWORD manquante}"
: "${PROJECT_ID:?PROJECT_ID manquant — lancez d'abord 02-create-project.sh}"

if [ ! -d "$IMAGES_DIR" ]; then
  echo "[06] ERREUR : dossier images introuvable : $IMAGES_DIR"
  exit 1
fi

echo "[06] Authentification..."
TOKEN=$(curl -sf -X POST "$SYMFONY_API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$SYMFONY_SERVICE_EMAIL\",\"password\":\"$SYMFONY_SERVICE_PASSWORD\"}" \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "[06] ERREUR : authentification échouée"
  exit 1
fi
echo "[06] Authentifié ✓"

# Collect image files
mapfile -t ALL_IMAGES < <(find "$IMAGES_DIR" -maxdepth 1 -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" \) | sort)
TOTAL=${#ALL_IMAGES[@]}

if [ "$TOTAL" -eq 0 ]; then
  echo "[06] Aucune image trouvée dans $IMAGES_DIR"
  exit 0
fi

echo "[06] $TOTAL images à uploader (batch de $BATCH_SIZE)..."

uploaded=0
errors=0
batch_num=0

for (( i=0; i<TOTAL; i+=BATCH_SIZE )); do
  batch_num=$((batch_num + 1))
  batch=("${ALL_IMAGES[@]:i:BATCH_SIZE}")
  batch_count=${#batch[@]}

  # Build curl -F args for each file in batch
  FORM_ARGS=()
  for img in "${batch[@]}"; do
    FORM_ARGS+=(-F "files[]=@$img")
  done

  echo "[06] Batch $batch_num — $batch_count fichiers..."
  RESPONSE=$(curl -sf -X POST \
    "$SYMFONY_API_URL/api/projects/$PROJECT_ID/media-objects/bulk" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Accept: application/json" \
    "${FORM_ARGS[@]}" \
    -w "\n%{http_code}" || true)

  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  BODY=$(echo "$RESPONSE" | head -n -1)

  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    uploaded=$((uploaded + batch_count))
    echo "[06]   ✓ $batch_count images uploadées"
  else
    echo "[06]   ✗ Batch $batch_num — HTTP $HTTP_CODE : ${BODY:0:200}"
    errors=$((errors + batch_count))
  fi
done

echo "[06] Upload images — uploadées: $uploaded / $TOTAL, erreurs: $errors"
[ "$errors" -gt 0 ] && exit 1 || true
