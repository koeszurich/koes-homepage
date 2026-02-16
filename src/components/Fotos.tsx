import { useEffect, useState, useCallback, useRef } from 'react';
import { Camera } from 'lucide-react';
import { useAlbum } from './AlbumProvider';
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

/** Pick a random element from an array */
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Build 3 album tiles + 1 "Alle anzeigen" tile.
 * Guarantees no album or image file appears more than once.
 */
function buildPreview(
  albumData: AlbumImages[],
): { albumTiles: PreviewTile[]; alleTile: { album: string; file: string } | null } {
  if (albumData.length === 0) return { albumTiles: [], alleTile: null };

  // Shuffle albums
  const shuffled = [...albumData].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);
  const usedImages = new Set<string>();
  const usedAlbumNames = new Set<string>();

  const albumTiles: PreviewTile[] = [];
  for (const entry of selected) {
    if (entry.files.length === 0) continue;
    const file = pickRandom(entry.files);
    const key = `${entry.album.name}/${file}`;
    usedImages.add(key);
    usedAlbumNames.add(entry.album.name);
    albumTiles.push({
      album: entry.album.name,
      displayName: entry.album.displayName,
      file,
    });
  }

  // "Alle anzeigen" tile: pick an image from any album, preferring albums not yet shown
  let alleTile: { album: string; file: string } | null = null;
  const remainingAlbums = albumData.filter(a => !usedAlbumNames.has(a.album.name) && a.files.length > 0);
  const allePool = remainingAlbums.length > 0 ? remainingAlbums : albumData.filter(a => a.files.length > 0);

  if (allePool.length > 0) {
    const alleAlbum = pickRandom(allePool);
    // Avoid reusing an already-shown image
    const availableFiles = alleAlbum.files.filter(f => !usedImages.has(`${alleAlbum.album.name}/${f}`));
    const file = availableFiles.length > 0 ? pickRandom(availableFiles) : pickRandom(alleAlbum.files);
    alleTile = { album: alleAlbum.album.name, file };
  }

  return { albumTiles, alleTile };
}

const Fotos = () => {
  const { openAlbum } = useAlbum();
  const [albumData, setAlbumData] = useState<AlbumImages[]>([]);
  const [albumTiles, setAlbumTiles] = useState<PreviewTile[]>([]);
  const [alleTile, setAlleTile] = useState<{ album: string; file: string } | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const albumDataRef = useRef<AlbumImages[]>([]);

  // Fetch all album data on mount
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const res = await fetch('/data/albums/index.json');
        const albumList: AlbumEntry[] = await res.json();
        if (cancelled) return;

        const data: AlbumImages[] = [];
        for (const album of albumList) {
          try {
            const imgRes = await fetch(`/data/albums/${encodeURIComponent(album.name)}/index.json`);
            const files: string[] = await imgRes.json();
            data.push({ album, files });
          } catch {
            // skip
          }
        }
        if (cancelled) return;

        albumDataRef.current = data;
        setAlbumData(data);

        const { albumTiles: tiles, alleTile: alle } = buildPreview(data);
        setAlbumTiles(tiles);
        setAlleTile(alle);
        setLoaded(true);
        requestAnimationFrame(() => {
          if (!cancelled) setFadeIn(true);
        });
      } catch {
        // fail silently
      }
    };

    loadData();
    return () => { cancelled = true; };
  }, []);

  // Rotate preview every ROTATE_INTERVAL ms
  useEffect(() => {
    if (!loaded || albumData.length === 0) return;

    const interval = setInterval(() => {
      const { albumTiles: tiles, alleTile: alle } = buildPreview(albumDataRef.current);
      setAlbumTiles(tiles);
      setAlleTile(alle);
    }, ROTATE_INTERVAL);

    return () => clearInterval(interval);
  }, [loaded, albumData.length]);

  const handleOpenDefault = useCallback(() => {
    if (albumData.length > 0) {
      openAlbum(albumData[0].album.name);
    }
  }, [albumData, openAlbum]);

  if (!loaded || albumTiles.length === 0) {
    return null;
  }

  return (
    <section id="fotos" className="section-padding bg-white">
      <div className="container mx-auto">
        <h2 className="section-title text-center">Fotos</h2>
        <p className="section-subtitle text-center">
          Eindrücke von unseren vergangenen Events
        </p>

        {/* Preview tiles: 3 albums + "Alle anzeigen" */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 transition-opacity duration-500 ${
          fadeIn ? 'opacity-100' : 'opacity-0'
        }`}>
          {albumTiles.map((tile) => (
            <button
              key={tile.album}
              onClick={() => openAlbum(tile.album)}
              className="relative aspect-[4/3] overflow-hidden rounded-lg group focus:outline-none focus:ring-2 focus:ring-koes-red"
            >
              <img
                src={`/data/albums/${encodeURIComponent(tile.album)}/${tile.file}`}
                alt={tile.displayName}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300" />
              <span className="absolute bottom-3 left-3 right-3 text-white text-sm sm:text-base font-semibold drop-shadow-lg text-left leading-tight">
                {tile.displayName}
              </span>
            </button>
          ))}

          {/* "Alle anzeigen" tile */}
          {alleTile && (
            <button
              onClick={handleOpenDefault}
              className="relative aspect-[4/3] overflow-hidden rounded-lg group focus:outline-none focus:ring-2 focus:ring-koes-red"
            >
              <img
                src={`/data/albums/${encodeURIComponent(alleTile.album)}/${alleTile.file}`}
                alt="Alle Fotos anzeigen"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300" />
              <span className="absolute bottom-3 left-3 right-3 text-white text-sm sm:text-base font-semibold drop-shadow-lg text-left leading-tight flex items-center gap-1.5">
                <Camera size={16} className="shrink-0" />
                Alle anzeigen
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default Fotos;
