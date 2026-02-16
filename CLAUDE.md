# Photo Album Feature

## Overview

Replaced the "Vergangene Events" (Past Events) section with a "Fotos" (Photos) section featuring album browsing, image enlargement, and URL-based routing compatible with GitHub Pages.

## Changes

### New Files

- `src/components/AlbumProvider.tsx` — React context provider managing album state and hash-based routing (`#fotos/{album}`, `#fotos/{album}/{imageIndex}`)
- `src/components/AlbumDialog.tsx` — Full-screen popup (fixed height) with album selector (pill buttons), image grid, enlarged image view with prev/next navigation, keyboard support, touch swipe, smooth fade transitions, and loading spinners
- `src/components/Fotos.tsx` — Main section component with 3 album preview tiles (name overlay on random image) + an "Alle anzeigen" tile that rotates every 10 seconds; grid uses `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` matching Team section layout
- `src/types/album.ts` — Shared `AlbumEntry` type definition
- `scripts/update-album.sh` — Bash script to create/update album index files from image files in a directory

### Modified Files

- `src/App.tsx` — Added `AlbumProvider` wrapper
- `src/pages/Index.tsx` — Replaced `PastEvents` with `Fotos` + `AlbumDialog`
- `src/components/Navbar.tsx` — Changed "Vergangene Events" nav link to "Fotos" (`#fotos`)

### Data Files

- `public/data/albums/index.json` — Album list (reverse chronological order)
- `public/data/albums/{album}/index.json` — Image file list per album
- Images copied from `public/events/*` to `public/data/albums/*`

### Albums Created

1. `schmarrn-2025` — Kaiserschmarren und Almdudler (März 2025)
2. `semester-auftakt-FS25` — Semesterauftakt FS25 (Februar 2025)
3. `gluehwein-2024` — Glühweinplausch mit Apfelstrudel (Dezember 2024)
4. `party-hoeng-2024` — KÖS Party im Student-Village (November 2024)
5. `global-village-2024` — Global Village an der UZH (November 2024)

## Architecture

### Routing (GitHub Pages compatible)

Uses URL hash fragments (like `WhatsAppProvider.tsx`):
- `#fotos/{album}` — Opens album dialog with the specified album selected
- `#fotos/{album}/{imageIndex}` — Opens the enlarged view of a specific image
- Hash changes update via `window.history.replaceState()` and `hashchange` event listener

### Album Script Usage

```bash
./scripts/update-album.sh <album-name> <display-name>
# Example:
./scripts/update-album.sh summer-fest-2025 "Sommerfest (Juni 2025)"
```

The script:
1. Scans the album directory for image files (jpeg, jpg, png, webp, gif)
2. Creates/updates `public/data/albums/{album}/index.json`
3. Adds/updates the entry in `public/data/albums/index.json`
