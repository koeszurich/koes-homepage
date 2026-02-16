import { useEffect, useState, useCallback } from 'react';
import { Camera } from 'lucide-react';
import { useAlbum } from './AlbumProvider';
import type { AlbumEntry } from '@/types/album';

const PREVIEW_COUNT = 4;
const ROTATE_INTERVAL = 10_000;

const Fotos = () => {
  const { openAlbum, openImage } = useAlbum();
  const [albums, setAlbums] = useState<AlbumEntry[]>([]);
  const [previewImages, setPreviewImages] = useState<{ album: string; file: string; globalIndex: number }[]>([]);
  const [allImages, setAllImages] = useState<{ album: string; file: string }[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Fetch albums and their images for the preview
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const res = await fetch('/data/albums/index.json');
        const albumList: AlbumEntry[] = await res.json();
        if (cancelled) return;
        setAlbums(albumList);

        // Load images from all albums for the preview pool
        const allImgs: { album: string; file: string }[] = [];
        for (const album of albumList) {
          try {
            const imgRes = await fetch(`/data/albums/${encodeURIComponent(album.name)}/index.json`);
            const imgs: string[] = await imgRes.json();
            for (const file of imgs) {
              allImgs.push({ album: album.name, file });
            }
          } catch {
            // skip albums that fail to load
          }
        }
        if (cancelled) return;
        setAllImages(allImgs);

        // Pick initial preview images
        const initial = allImgs.slice(0, PREVIEW_COUNT).map((img, i) => ({ ...img, globalIndex: i }));
        setPreviewImages(initial);
        setLoaded(true);
      } catch {
        // fail silently
      }
    };

    loadData();
    return () => { cancelled = true; };
  }, []);

  // Rotate one preview image every ROTATE_INTERVAL ms
  useEffect(() => {
    if (!loaded || allImages.length <= PREVIEW_COUNT) return;

    let nextPoolIndex = PREVIEW_COUNT;
    let slotToReplace = 0;

    const interval = setInterval(() => {
      const poolIdx = nextPoolIndex % allImages.length;
      const img = allImages[poolIdx];
      nextPoolIndex++;

      setPreviewImages(prev => {
        const next = [...prev];
        next[slotToReplace % PREVIEW_COUNT] = { ...img, globalIndex: poolIdx };
        return next;
      });
      slotToReplace++;
    }, ROTATE_INTERVAL);

    return () => clearInterval(interval);
  }, [loaded, allImages]);

  const handleOpenAlbum = useCallback(() => {
    if (albums.length > 0) {
      openAlbum(albums[0].name);
    }
  }, [albums, openAlbum]);

  const handleClickPreview = useCallback((albumName: string, file: string) => {
    // Find the index of this image in its album
    // We need to fetch the album images to find the correct index
    fetch(`/data/albums/${encodeURIComponent(albumName)}/index.json`)
      .then(r => r.json())
      .then((imgs: string[]) => {
        const idx = imgs.indexOf(file);
        openImage(albumName, idx >= 0 ? idx : 0);
      })
      .catch(() => openAlbum(albumName));
  }, [openImage, openAlbum]);

  if (!loaded || previewImages.length === 0) {
    return null;
  }

  return (
    <section id="fotos" className="section-padding bg-white">
      <div className="container mx-auto">
        <h2 className="section-title text-center">Fotos</h2>
        <p className="section-subtitle text-center">
          Eindrücke von unseren vergangenen Events
        </p>

        {/* Preview row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-8">
          {previewImages.map((img, idx) => (
            <button
              key={`${img.album}-${img.file}-${idx}`}
              onClick={() => handleClickPreview(img.album, img.file)}
              className="relative aspect-[4/3] overflow-hidden rounded-lg group focus:outline-none focus:ring-2 focus:ring-koes-red"
            >
              <img
                src={`/data/albums/${encodeURIComponent(img.album)}/${img.file}`}
                alt={`Vorschau ${idx + 1}`}
                loading="lazy"
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            </button>
          ))}
        </div>

        {/* "Alle anzeigen" button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleOpenAlbum}
            className="cta-button-secondary flex items-center gap-2"
          >
            <Camera size={18} />
            Alle anzeigen
          </button>
        </div>
      </div>
    </section>
  );
};

export default Fotos;
