import { useEffect, useState, useCallback, useRef } from 'react';
import { Camera } from 'lucide-react';
import { useAlbum } from './AlbumProvider';
import { fetchAlbums, fetchAlbumContents, thumbnailUrl } from '@/lib/galleryApi';
import { formatAlbumDate } from '@/lib/utils';
import type { Album, AlbumImage } from '@/types/album';

const ROTATE_INTERVAL = 10_000;
/** Matches the fade of `PreviewTileImage`, so content is swapped while invisible. */
const FADE_DURATION = 700;
const ALBUM_TILE_COUNT = 3;

/** One preview tile: an album and the image currently standing in for it. */
interface Tile {
  album: Album;
  image: AlbumImage;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

/**
 * Pick an album that is not already on screen together with one of its images.
 * Albums are tried in random order until one yields an image, so an album that
 * cannot be loaded just costs a candidate. Falls back to repeating an album (an
 * image is never repeated) when there are fewer albums than tiles.
 *
 * Only the chosen candidates are fetched, so the section costs one listing plus
 * one request per tile rather than one per album.
 */
async function pickTile(
  albums: Album[],
  usedAlbums: Set<string>,
  usedImages: Set<string>,
): Promise<Tile | null> {
  const nonEmpty = albums.filter(album => album.imageCount > 0);
  const unused = nonEmpty.filter(album => !usedAlbums.has(album.name));
  const candidates = shuffle(unused.length > 0 ? unused : nonEmpty);

  for (const album of candidates) {
    let images: AlbumImage[];
    try {
      images = (await fetchAlbumContents(album.name)).images;
    } catch {
      continue;
    }
    const fresh = images.filter(image => !usedImages.has(image.id));
    const pool = fresh.length > 0 ? fresh : images;
    if (pool.length > 0) {
      return { album, image: pickRandom(pool) };
    }
  }
  return null;
}

/** Build the initial 3 album tiles + the image behind "Alle anzeigen". */
async function buildTiles(albums: Album[]): Promise<{ albumTiles: Tile[]; alleTile: Tile | null }> {
  const usedAlbums = new Set<string>();
  const usedImages = new Set<string>();
  const albumTiles: Tile[] = [];

  for (let i = 0; i < ALBUM_TILE_COUNT; i++) {
    const tile = await pickTile(albums, usedAlbums, usedImages);
    if (!tile) break;
    usedAlbums.add(tile.album.name);
    usedImages.add(tile.image.id);
    albumTiles.push(tile);
  }

  // The "Alle anzeigen" tile only borrows an image; it may repeat an album that
  // is already shown, but not an image.
  const alleTile = await pickTile(albums, usedAlbums, usedImages);
  return { albumTiles, alleTile };
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
  const [albums, setAlbums] = useState<Album[]>([]);
  const [albumTiles, setAlbumTiles] = useState<Tile[]>([]);
  const [alleTile, setAlleTile] = useState<Tile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [fadingSlot, setFadingSlot] = useState<number | null>(null);
  const albumsRef = useRef<Album[]>([]);
  const tilesRef = useRef<Tile[]>([]);
  const alleRef = useRef<Tile | null>(null);
  const nextSlotRef = useRef(0);

  // Fetch the album list and the images of the albums actually shown (cached).
  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      try {
        const albumList = await fetchAlbums();
        if (cancelled) return;
        albumsRef.current = albumList;
        setAlbums(albumList);

        const { albumTiles: tiles, alleTile: alle } = await buildTiles(albumList);
        if (cancelled || tiles.length === 0) return;

        tilesRef.current = tiles;
        alleRef.current = alle;
        setAlbumTiles(tiles);
        setAlleTile(alle);
        setLoaded(true);
        requestAnimationFrame(() => { if (!cancelled) setFadeIn(true); });
      } catch { /* fail silently: the section stays hidden */ }
    };
    loadData();
    return () => { cancelled = true; };
  }, []);

  // Rotate one tile at a time with fade effect
  useEffect(() => {
    if (!loaded) return;
    let cancelled = false;

    const interval = setInterval(() => {
      const totalSlots = tilesRef.current.length + (alleRef.current ? 1 : 0);
      const slot = nextSlotRef.current % totalSlots;
      nextSlotRef.current++;
      const isAlleSlot = slot >= tilesRef.current.length;

      // Everything visible except the slot being replaced stays off limits.
      const usedAlbums = new Set<string>();
      const usedImages = new Set<string>();
      tilesRef.current.forEach((tile, index) => {
        if (!isAlleSlot && index === slot) return;
        usedAlbums.add(tile.album.name);
        usedImages.add(tile.image.id);
      });
      if (!isAlleSlot && alleRef.current) {
        usedImages.add(alleRef.current.image.id);
      }

      // Phase 1: fade out, and load the replacement while it fades.
      setFadingSlot(slot);
      const replacement = pickTile(albumsRef.current, usedAlbums, usedImages).catch(() => null);

      // Phase 2: after the fade-out, swap the content and fade back in.
      setTimeout(async () => {
        const tile = await replacement;
        if (cancelled) return;
        if (tile) {
          if (isAlleSlot) {
            alleRef.current = tile;
            setAlleTile(tile);
          } else {
            const newTiles = [...tilesRef.current];
            newTiles[slot] = tile;
            tilesRef.current = newTiles;
            setAlbumTiles(newTiles);
          }
        }
        setFadingSlot(null);
      }, FADE_DURATION);
    }, ROTATE_INTERVAL);

    return () => { cancelled = true; clearInterval(interval); };
  }, [loaded]);

  const handleOpenDefault = useCallback(() => {
    if (albums.length > 0) {
      openAlbum(albums[0].name);
    }
  }, [albums, openAlbum]);

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
              src={thumbnailUrl(tile.image)}
              alt={tile.album.displayName}
              fading={fadingSlot === idx}
              onClick={() => openAlbum(tile.album.name)}
            >
              <span className="absolute inset-0 flex flex-col items-center justify-center text-white text-sm sm:text-base drop-shadow-lg text-center leading-tight px-3">
                <span className="font-semibold">{tile.album.displayName}</span>
                <span className="mt-1 text-xs sm:text-sm font-normal">
                  {formatAlbumDate(tile.album.date)}
                </span>
              </span>
            </PreviewTileImage>
          ))}

          {alleTile && (
            <PreviewTileImage
              key="alle"
              src={thumbnailUrl(alleTile.image)}
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
