#!/usr/bin/env bash
#
# Usage: ./scripts/update-album.sh <album-name> <display-name>
#
# Creates or updates album index files from existing image files.
#   - Creates public/data/albums/<album-name>/index.json from image files in the directory.
#   - Adds/updates the album entry in public/data/albums/index.json.
#
# Example:
#   ./scripts/update-album.sh schmarrn-2025 "Kaiserschmarren und Almdudler (März 2025)"

set -euo pipefail

if [ $# -ne 2 ]; then
  echo "Usage: $0 <album-name> <display-name>" >&2
  exit 1
fi

ALBUM_NAME="$1"
DISPLAY_NAME="$2"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ALBUMS_DIR="$PROJECT_ROOT/public/data/albums"
ALBUM_DIR="$ALBUMS_DIR/$ALBUM_NAME"

# Ensure albums directory exists
mkdir -p "$ALBUM_DIR"

# Build album index.json from image files in the directory
IMAGE_FILES=()
while IFS= read -r -d '' file; do
  IMAGE_FILES+=("$(basename "$file")")
done < <(find "$ALBUM_DIR" -maxdepth 1 -type f \( -iname '*.jpeg' -o -iname '*.jpg' -o -iname '*.png' -o -iname '*.webp' -o -iname '*.gif' \) -print0 | sort -z)

if [ ${#IMAGE_FILES[@]} -eq 0 ]; then
  echo "Warning: No image files found in $ALBUM_DIR" >&2
fi

# Write album's index.json
ALBUM_INDEX="$ALBUM_DIR/index.json"
printf '[' > "$ALBUM_INDEX"
for i in "${!IMAGE_FILES[@]}"; do
  if [ "$i" -gt 0 ]; then
    printf ', ' >> "$ALBUM_INDEX"
  fi
  printf '"%s"' "${IMAGE_FILES[$i]}" >> "$ALBUM_INDEX"
done
printf ']\n' >> "$ALBUM_INDEX"

echo "Updated $ALBUM_INDEX with ${#IMAGE_FILES[@]} image(s)."

# Update the global albums index.json
GLOBAL_INDEX="$ALBUMS_DIR/index.json"

if [ ! -f "$GLOBAL_INDEX" ]; then
  echo '[]' > "$GLOBAL_INDEX"
fi

# Check if album already exists in the global index
if grep -q "\"name\": *\"$ALBUM_NAME\"" "$GLOBAL_INDEX" 2>/dev/null; then
  # Update the display name for the existing entry
  # Use a temporary file for sed compatibility
  TMP_FILE=$(mktemp)
  # Match the entry block and update displayName
  python3 -c "
import json, sys
with open('$GLOBAL_INDEX', 'r') as f:
    albums = json.load(f)
for album in albums:
    if album['name'] == '$ALBUM_NAME':
        album['displayName'] = '''$DISPLAY_NAME'''
        break
with open('$GLOBAL_INDEX', 'w') as f:
    json.dump(albums, f, indent=2, ensure_ascii=False)
    f.write('\n')
"
  echo "Updated existing entry for '$ALBUM_NAME' in $GLOBAL_INDEX."
else
  # Add new album entry at the beginning (most recent first)
  python3 -c "
import json
with open('$GLOBAL_INDEX', 'r') as f:
    albums = json.load(f)
new_entry = {'name': '$ALBUM_NAME', 'displayName': '''$DISPLAY_NAME'''}
albums.insert(0, new_entry)
with open('$GLOBAL_INDEX', 'w') as f:
    json.dump(albums, f, indent=2, ensure_ascii=False)
    f.write('\n')
"
  echo "Added '$ALBUM_NAME' to $GLOBAL_INDEX."
fi

echo "Done."
