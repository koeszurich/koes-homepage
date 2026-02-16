import { useEffect, useState, useCallback, useRef } from 'react';
import { Camera } from 'lucide-react';
import { useAlbum } from './AlbumProvider';
import { fetchAlbumList, fetchAlbumImages } from '@/lib/albumCache';
import type { AlbumEntry } from '@/types/album';

const ROTATE_INTERVAL = 10_000;

interface AlbumImages {
  album: AlbumEntry;
  files: string[];
}

interface PreviewTile {
  album: string;
  displayName: string;
  file: string;
}

interface AlleTile {
  album: string;
  file: string;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Build initial 3 album tiles + 1 "Alle anzeigen" tile.
 * No album or image appears more than once.
 */
function buildInitialPreview(
  albumData: AlbumImages[],
): { albumTiles: PreviewTile[]; alleTile: AlleTile | null } {
  if (albumData.length === 0) return { albumTiles: [], alleTile: null };

  const shuffled = [...albumData].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);
  const usedImages = new Set<string>();
  const usedAlbumNames = new Set<string>();

  const albumTiles: PreviewTile[] = [];
  for (const entry of selected) {
    if (entry.files.length === 0) continue;
    const file = pickRandom(entry.files);
    usedImages.add(`${entry.album.name}/${file}`);
    usedAlbumNames.add(entry.album.name);
    albumTiles.push({ album: entry.album.name, displayName: entry.album.displayName, file });
  }

  let alleTile: AlleTile | null = null;
  const remaining = albumData.filter(a => !usedAlbumNames.has(a.album.name) && a.files.length > 0);
  const pool = remaining.length > 0 ? remaining : albumData.filter(a => a.files.length > 0);
  if (pool.length > 0) {
    const alleAlbum = pickRandom(pool);
    const available = alleAlbum.files.filter(f => !usedImages.has(`${alleAlbum.album.name}/${f}`));
    const file = available.length > 0 ? pickRandom(available) : pickRandom(alleAlbum.files);
    alleTile = { album: alleAlbum.album.name, file };
  }

  return { albumTiles, alleTile };
}

/**
 * Replace a single tile (at slotIndex) with a new random album/image,
 * ensuring no duplicate albums or images with the other visible tiles.
 */
function rotateSingleTile(
  albumData: AlbumImages[],
  currentTiles: PreviewTile[],
  currentAlle: AlleTile | null,
  slotIndex: number,
): { albumTiles: PreviewTile[]; alleTile: AlleTile | null } {
  // Collect what's currently used, excluding the slot being replaced
  const usedAlbumNames = new Set<string>();
  const usedImages = new Set<string>();

  const isAlleSlot = slotIndex >= currentTiles.length;

  currentTiles.forEach((t, i) => {
    if (!isAlleSlot && i === slotIndex) return;
    usedAlbumNames.add(t.album);
    usedImages.add(`${t.album}/${t.file}`);
  });
  if (!isAlleSlot && currentAlle) {
    usedImages.add(`${currentAlle.album}/${currentAlle.file}`);
  }

  if (isAlleSlot) {
    // Replace the "Alle anzeigen" tile's background image
    const pool = albumData.filter(a => a.files.length > 0);
    if (pool.length === 0) return { albumTiles: currentTiles, alleTile: currentAlle };
    const alleAlbum = pickRandom(pool);
    const available = alleAlbum.files.filter(f => !usedImages.has(`${alleAlbum.album.name}/${f}`));
    const file = available.length > 0 ? pickRandom(available) : pickRandom(alleAlbum.files);
    return { albumTiles: currentTiles, alleTile: { album: alleAlbum.album.name, file } };
  }

  // Replace an album tile
  const availableAlbums = albumData.filter(
    a => !usedAlbumNames.has(a.album.name) && a.files.length > 0,
  );
  const pool = availableAlbums.length > 0
    ? availableAlbums
    : albumData.filter(a => a.files.length > 0);
  if (pool.length === 0) return { albumTiles: currentTiles, alleTile: currentAlle };

  const chosen = pickRandom(pool);
  const availableFiles = chosen.files.filter(f => !usedImages.has(`${chosen.album.name}/${f}`));
  const file = availableFiles.length > 0 ? pickRandom(availableFiles) : pickRandom(chosen.files);

  const newTiles = [...currentTiles];
  newTiles[slotIndex] = { album: chosen.album.name, displayName: chosen.album.displayName, file };
  return { albumTiles: newTiles, alleTile: currentAlle };
}

/** Single preview tile with placeholder and fade transition. */
const PreviewTileImage = ({
  src, alt, fading, children, onClick,
}: {
  src: string; alt: string; fading: boolean;
  children: React.ReactNode; onClick: () => void;
}) => {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const isLoaded = loadedSrc === src;

  return (
    <button
      onClick={onClick}
      className={`relative aspect-[4/3] overflow-hidden rounded-lg group focus:outline-none focus:ring-2 focus:ring-koes-red bg-gray-200 transition-opacity duration-700 ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-200 rounded-lg" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoadedSrc(src)}
        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors duration-300" />
      {children}
    </button>
  );
};

const Fotos = () => {
  const { openAlbum } = useAlbum();
  const [albumData, setAlbumData] = useState<AlbumImages[]>([]);
  const [albumTiles, setAlbumTiles] = useState<PreviewTile[]>([]);
  const [alleTile, setAlleTile] = useState<AlleTile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [fadingSlot, setFadingSlot] = useState<number | null>(null);
  const albumDataRef = useRef<AlbumImages[]>([]);
  const tilesRef = useRef<PreviewTile[]>([]);
  const alleRef = useRef<AlleTile | null>(null);
  const nextSlotRef = useRef(0);

  // Fetch all album data on mount (cached)
  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      try {
        const albumList = await fetchAlbumList();
        if (cancelled) return;

        const data: AlbumImages[] = [];
        for (const album of albumList) {
          try {
            const files = await fetchAlbumImages(album.name);
            data.push({ album, files });
          } catch { /* skip */ }
        }
        if (cancelled) return;

        albumDataRef.current = data;
        setAlbumData(data);

        const { albumTiles: tiles, alleTile: alle } = buildInitialPreview(data);
        tilesRef.current = tiles;
        alleRef.current = alle;
        setAlbumTiles(tiles);
        setAlleTile(alle);
        setLoaded(true);
        requestAnimationFrame(() => { if (!cancelled) setFadeIn(true); });
      } catch { /* fail silently */ }
    };
    loadData();
    return () => { cancelled = true; };
  }, []);

  // Rotate one tile at a time with fade effect
  useEffect(() => {
    if (!loaded || albumData.length === 0) return;
    const totalSlots = tilesRef.current.length + 1; // +1 for Alle tile

    const interval = setInterval(() => {
      const slot = nextSlotRef.current % totalSlots;
      nextSlotRef.current++;

      // Phase 1: Fade out
      setFadingSlot(slot);

      // Phase 2: After fade-out completes, swap content and fade in
      setTimeout(() => {
        const { albumTiles: newTiles, alleTile: newAlle } = rotateSingleTile(
          albumDataRef.current, tilesRef.current, alleRef.current, slot,
        );
        tilesRef.current = newTiles;
        alleRef.current = newAlle;
        setAlbumTiles(newTiles);
        setAlleTile(newAlle);
        setFadingSlot(null);
      }, 700); // matches transition-opacity duration
    }, ROTATE_INTERVAL);

    return () => clearInterval(interval);
  }, [loaded, albumData.length]);

  const handleOpenDefault = useCallback(() => {
    if (albumData.length > 0) {
      openAlbum(albumData[0].album.name);
    }
  }, [albumData, openAlbum]);

  if (!loaded || albumTiles.length === 0) return null;

  return (
    <section id="fotos" className="section-padding bg-white">
      <div className="container mx-auto">
        <h2 className="section-title text-center">Fotos</h2>
        <p className="section-subtitle text-center">
          Eindrücke von unseren vergangenen Events
        </p>

        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 transition-opacity duration-500 ${
          fadeIn ? 'opacity-100' : 'opacity-0'
        }`}>
          {albumTiles.map((tile, idx) => (
            <PreviewTileImage
              key={`album-${idx}`}
              src={`/data/albums/${encodeURIComponent(tile.album)}/${tile.file}`}
              alt={tile.displayName}
              fading={fadingSlot === idx}
              onClick={() => openAlbum(tile.album)}
            >
              <span className="absolute inset-0 flex items-center justify-center text-white text-sm sm:text-base font-semibold drop-shadow-lg text-center leading-tight px-3">
                {tile.displayName}
              </span>
            </PreviewTileImage>
          ))}

          {alleTile && (
            <PreviewTileImage
              key="alle"
              src={`/data/albums/${encodeURIComponent(alleTile.album)}/${alleTile.file}`}
              alt="Alle Fotos anzeigen"
              fading={fadingSlot === albumTiles.length}
              onClick={handleOpenDefault}
            >
              <span className="absolute inset-0 flex items-center justify-center text-white text-sm sm:text-base font-semibold drop-shadow-lg text-center leading-tight px-3 gap-1.5">
                <Camera size={16} className="shrink-0" />
                Alle anzeigen
              </span>
            </PreviewTileImage>
          )}
        </div>
      </div>
    </section>
  );
};

export default Fotos;
