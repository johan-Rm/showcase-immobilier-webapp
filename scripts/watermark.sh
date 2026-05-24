#!/usr/bin/env bash

set -euo pipefail

SOURCE_DIR="/home/johan/www/graines-digitales/modern-web-apps/mlk-my-little-kasbah/public/images/originals"
TARGET_DIR="/home/johan/www/graines-digitales/modern-web-apps/mlk-my-little-kasbah/public/images"

WATERMARK_SRC="/home/johan/www/graines-digitales/modern-web-apps/mlk-my-little-kasbah/app/assets/logo/watermark4.png"
TMP_WATERMARK="/tmp/mlk-watermark.png"

OPACITY=20
POSITION="center"
MARGIN="+0+0"
QUALITY=95

# 🔥 ratio global + réduction 50%
WATERMARK_RATIO=0.22
WATERMARK_SCALE=0.6

if command -v magick >/dev/null 2>&1; then
  IM_CMD="magick"
  IDENTIFY_CMD="magick identify"
elif command -v convert >/dev/null 2>&1; then
  IM_CMD="convert"
  IDENTIFY_CMD="identify"
else
  echo "❌ ImageMagick introuvable"
  exit 1
fi

mkdir -p "$TARGET_DIR"

process_image() {
  local img="$1"
  local filename output width wm_width

  filename="$(basename "$img")"
  output="${TARGET_DIR}/${filename}"

  echo "→ Traitement : $filename"

  # 🔥 récupérer largeur image
  width=$($IDENTIFY_CMD -format "%w" "$img")

  # 🔥 calcul watermark (ratio)
  wm_width=$(printf "%.0f" "$(echo "$width * $WATERMARK_RATIO * $WATERMARK_SCALE" | bc -l)")

  # 🔥 générer watermark à la bonne taille
  "$IM_CMD" "$WATERMARK_SRC" \
    -filter Lanczos \
    -resize "${wm_width}x" \
    -alpha set \
    -channel A \
    -evaluate multiply $(echo "$OPACITY / 100" | bc -l) \
    -strip \
    "PNG32:$TMP_WATERMARK"

  "$IM_CMD" "$img" \
    \( "$TMP_WATERMARK" \
      -alpha extract \
      -background "rgba(255,255,255,${OPACITY}%)" \
      -alpha shape \
    \) \
    -gravity "$POSITION" \
    -auto-orient \
    -geometry "$MARGIN" \
    -composite \
    -quality "$QUALITY" \
    "$output"
}

find "$SOURCE_DIR" -type f \( \
  -iname "*.jpg" -o \
  -iname "*.jpeg" -o \
  -iname "*.png" \
\) | while read -r img; do
  process_image "$img"
done

echo "✅ Terminé"