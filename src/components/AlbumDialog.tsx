import { useEffect, useState, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAlbum } from './AlbumProvider';
import type { AlbumEntry } from '@/types/album';

const AlbumDialog = () => {
  const { state, openAlbum, openImage, closeDialog, closeImage } = useAlbum();
  const [albums, setAlbums] = useState<AlbumEntry[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const prevAlbumRef = useRef<string | null>(null);
  const isOpen = state.album !== null;

  // Fetch album list when dialog opens
  useEffect(() => {
    if (!isOpen) return;
    // Only fetch once when dialog opens
    if (prevAlbumRef.current !== null && albums.length > 0) return;

    let cancelled = false;
    const fetchAlbums = async () => {
      try {
        const res = await fetch('/data/albums/index.json');
        const data: AlbumEntry[] = await res.json();
        if (!cancelled) setAlbums(data);
      } catch {
        if (!cancelled) setAlbums([]);
      } finally {
        if (!cancelled) setLoadingAlbums(false);
      }
    };
    setLoadingAlbums(true);
    fetchAlbums();
    return () => { cancelled = true; };
  }, [isOpen, albums.length]);

  // Fetch images for selected album
  useEffect(() => {
    const album = state.album;
    if (!album) {
      // Don't call setImages here to avoid setState in effect body
      prevAlbumRef.current = null;
      return;
    }
    if (album === prevAlbumRef.current) return;
    prevAlbumRef.current = album;

    let cancelled = false;
    const fetchImages = async () => {
      try {
        const res = await fetch(`/data/albums/${encodeURIComponent(album)}/index.json`);
        const data: string[] = await res.json();
        if (!cancelled) setImages(data);
      } catch {
        if (!cancelled) setImages([]);
      } finally {
        if (!cancelled) setLoadingImages(false);
      }
    };
    setLoadingImages(true);
    setImages([]);
    fetchImages();
    return () => { cancelled = true; };
  }, [state.album]);

  const handlePrev = useCallback(() => {
    if (state.album && state.imageIndex !== null && state.imageIndex > 0) {
      openImage(state.album, state.imageIndex - 1);
    }
  }, [state.album, state.imageIndex, openImage]);

  const handleNext = useCallback(() => {
    if (state.album && state.imageIndex !== null && state.imageIndex < images.length - 1) {
      openImage(state.album, state.imageIndex + 1);
    }
  }, [state.album, state.imageIndex, images.length, openImage]);

  // Keyboard navigation for enlarged view
  useEffect(() => {
    if (state.imageIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'Escape') closeImage();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [state.imageIndex, handlePrev, handleNext, closeImage]);

  // Escape to close dialog (when not in enlarged view)
  useEffect(() => {
    if (state.album === null || state.imageIndex !== null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDialog();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [state.album, state.imageIndex, closeDialog]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (state.album === null) return null;

  const selectedAlbum = albums.find(a => a.name === state.album);

  return (
    <>
      {/* Album Grid Dialog */}
      <div
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2 md:p-4"
        onClick={closeDialog}
      >
        <div
          className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] flex flex-col relative"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center shrink-0">
            <h3 className="text-xl font-bold text-koes-dark">
              {selectedAlbum?.displayName || state.album}
            </h3>
            <button
              onClick={closeDialog}
              className="text-gray-500 hover:text-koes-red transition-colors text-2xl leading-none"
              aria-label="Schließen"
            >
              <X size={24} />
            </button>
          </div>

          {/* Album selector */}
          <div className="px-4 py-3 border-b shrink-0 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {loadingAlbums ? (
                <span className="text-gray-400 text-sm">Laden...</span>
              ) : (
                albums.map(album => (
                  <button
                    key={album.name}
                    onClick={() => openAlbum(album.name)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                      album.name === state.album
                        ? 'bg-koes-red text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {album.displayName}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Image grid */}
          <div className="p-4 overflow-y-auto flex-1">
            {loadingImages ? (
              <div className="flex items-center justify-center py-12">
                <span className="text-gray-400">Fotos werden geladen...</span>
              </div>
            ) : images.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <span className="text-gray-400">Keine Fotos vorhanden.</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => state.album && openImage(state.album, index)}
                    className="relative aspect-square overflow-hidden rounded-lg group focus:outline-none focus:ring-2 focus:ring-koes-red"
                  >
                    <img
                      src={`/data/albums/${encodeURIComponent(state.album!)}/${img}`}
                      alt={`Foto ${index + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <div className="sticky bottom-0 w-full p-4 bg-white border-t md:hidden shrink-0">
            <button
              onClick={closeDialog}
              className="w-full py-2 px-4 bg-koes-red text-white rounded-lg hover:bg-koes-red/90 transition-colors"
            >
              Schließen
            </button>
          </div>
        </div>
      </div>

      {/* Enlarged image overlay */}
      {state.imageIndex !== null && images.length > 0 && state.imageIndex < images.length && (
        <div
          className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center"
          onClick={closeImage}
        >
          {/* Close button */}
          <button
            onClick={closeImage}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
            aria-label="Schließen"
          >
            <X size={32} />
          </button>

          {/* Previous button */}
          {state.imageIndex > 0 && (
            <button
              onClick={e => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors z-10 bg-black/30 rounded-full p-2"
              aria-label="Vorheriges Foto"
            >
              <ChevronLeft size={32} />
            </button>
          )}

          {/* Next button */}
          {state.imageIndex < images.length - 1 && (
            <button
              onClick={e => { e.stopPropagation(); handleNext(); }}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors z-10 bg-black/30 rounded-full p-2"
              aria-label="Nächstes Foto"
            >
              <ChevronRight size={32} />
            </button>
          )}

          {/* Image */}
          <img
            src={`/data/albums/${encodeURIComponent(state.album!)}/${images[state.imageIndex]}`}
            alt={`Foto ${state.imageIndex + 1} von ${images.length}`}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={e => e.stopPropagation()}
          />

          {/* Image counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {state.imageIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
};

export default AlbumDialog;
