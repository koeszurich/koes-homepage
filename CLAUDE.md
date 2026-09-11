# Photo Album Feature

## Overview

Replaced the "Vergangene Events" (Past Events) section with a "Fotos" (Photos) section
featuring album browsing, image enlargement, and URL-based routing compatible with
GitHub Pages. Albums and images come from the gallery API at `https://api.koes.ch`;
nothing about the gallery is stored in this repository.

## Changes

### New Files

- `src/components/AlbumProvider.tsx` — React context provider managing album state and hash-based routing (`#fotos/{album}`, `#fotos/{album}/{imageIndex}`)
- `src/components/AlbumDialog.tsx` — Full-screen popup (fixed height) with vertical sidebar (desktop) / tabs with overflow arrows (mobile) for album selection, image grid with per-image placeholder shimmer, enlarged image view with prev/next navigation, keyboard support, touch swipe, smooth fade transitions, and loading spinners
- `src/components/Fotos.tsx` — Main section component with 3 album preview tiles (centered name overlay on darkened random image) + an "Alle anzeigen" tile; rotates 1 tile at a time every 10 seconds with fade effect; grid uses `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` matching Team section layout
- `src/types/album.ts` — `Album`, `AlbumImage` and `AlbumContents` types
- `src/lib/galleryApi.ts` — Gallery API client: endpoint wrappers, image and thumbnail URLs, `snake_case` → `camelCase` mapping, and an in-memory cache of the JSON responses

### Modified Files

- `src/App.tsx` — Added `AlbumProvider` wrapper
- `src/pages/Index.tsx` — Replaced `PastEvents` with `Fotos` + `AlbumDialog`
- `src/components/Navbar.tsx` — Changed "Vergangene Events" nav link to "Fotos" (`#fotos`)

## Architecture

### Data source

Everything is read anonymously from the gallery API at `https://api.koes.ch`; albums
are maintained elsewhere, not in this repository.

| Endpoint | Used for |
|---|---|
| `GET /gallery/albums` | The album list of the sidebar/tabs and the pool the preview tiles draw from. |
| `GET /gallery/albums/{name}/images` | The images of one album. The response also carries the album itself, which is what makes an unlisted album reachable by URL although it is never listed. `404` means the album does not exist or may not be viewed. |
| `GET /gallery/images/{id}` | The original, used by the enlarged view only. |
| `GET /gallery/images/{id}/thumbnail?v={spec_version}` | The small tile used by every grid and preview tile. `v` is the thumbnail version the API reports for the image; tiles are cached aggressively, so the URL is what changes when they are regenerated. |

What a visitor may see is decided by the API alone. An unlisted album is opened by
its `#fotos/{album}` URL and is then shown in the sidebar next to the listed ones
for as long as the page lives.

The preview tiles fetch only the albums they actually show, so the section costs one
listing plus one request per tile rather than one request per album.

### Routing (GitHub Pages compatible)

Uses URL hash fragments (like `WhatsAppProvider.tsx`):
- `#fotos/{album}` — Opens album dialog with the specified album selected
- `#fotos/{album}/{imageIndex}` — Opens the enlarged view of a specific image
- Hash changes update via `window.history.replaceState()` and `hashchange` event listener
