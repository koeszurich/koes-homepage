import { useEffect, useState, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useAlbum } from './AlbumProvider';
import type { AlbumEntry } from '@/types/album';

const AlbumDialog = () => {
  const { state, openAlbum, openImage, closeDialog, closeImage } = useAlbum();
  const [albums, setAlbums] = useState<AlbumEntry[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [imageGridVisible, setImageGridVisible] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [enlargedVisible, setEnlargedVisible] = useState(false);
  const [enlargedImgLoaded, setEnlargedImgLoaded] = useState(false);
  const prevAlbumRef = useRef<string | null>(null);
  const isOpen = state.album !== null;

  // Touch swipe state
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchDeltaRef = useRef(0);

  // Animate dialog overlay on open
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setOverlayVisible(true));
    } else {
      setOverlayVisible(false);
    }
  }, [isOpen]);

  // Animate enlarged view
  useEffect(() => {
    if (state.imageIndex !== null) {
      setEnlargedImgLoaded(false);
      requestAnimationFrame(() => setEnlargedVisible(true));
    } else {
      setEnlargedVisible(false);
    }
  }, [state.imageIndex]);

  // Fetch album list when dialog opens
  useEffect(() => {
    if (!isOpen) return;
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
      prevAlbumRef.current = null;
      return;
    }
    if (album === prevAlbumRef.current) return;
    prevAlbumRef.current = album;

    setImageGridVisible(false);
    let cancelled = false;
    const fetchImages = async () => {
      try {
        const res = await fetch(`/data/albums/${encodeURIComponent(album)}/index.json`);
        const data: string[] = await res.json();
        if (!cancelled) {
          setImages(data);
          requestAnimationFrame(() => {
            if (!cancelled) setImageGridVisible(true);
          });
        }
      } catch {
        if (!cancelled) {
          setImages([]);
          setImageGridVisible(true);
        }
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
      setEnlargedImgLoaded(false);
      openImage(state.album, state.imageIndex - 1);
    }
  }, [state.album, state.imageIndex, openImage]);

  const handleNext = useCallback(() => {
    if (state.album && state.imageIndex !== null && state.imageIndex < images.length - 1) {
      setEnlargedImgLoaded(false);
      openImage(state.album, state.imageIndex + 1);
    }
  }, [state.album, state.imageIndex, images.length, openImage]);

  // Touch handlers for swipe navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    touchDeltaRef.current = 0;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    touchDeltaRef.current = e.touches[0].clientX - touchStartRef.current.x;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const delta = touchDeltaRef.current;
    const SWIPE_THRESHOLD = 50;
    if (delta > SWIPE_THRESHOLD) {
      handlePrev();
    } else if (delta < -SWIPE_THRESHOLD) {
      handleNext();
    }
    touchStartRef.current = null;
    touchDeltaRef.current = 0;
  }, [handlePrev, handleNext]);

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
        className={`fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2 md:p-4 transition-opacity duration-300 ${
          overlayVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeDialog}
      >
        <div
          className={`bg-white rounded-lg w-full max-w-6xl h-[90vh] md:h-[92vh] flex flex-col relative transition-all duration-300 ${
            overlayVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
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
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Loader2 size={14} className="animate-spin" />
                  Laden...
                </div>
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
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 size={32} className="animate-spin text-koes-red" />
                <span className="text-gray-400">Fotos werden geladen...</span>
              </div>
            ) : images.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <span className="text-gray-400">Keine Fotos vorhanden.</span>
              </div>
            ) : (
              <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 transition-opacity duration-300 ${
                imageGridVisible ? 'opacity-100' : 'opacity-0'
              }`}>
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
          className={`fixed inset-0 bg-black/95 z-[60] flex items-center justify-center transition-opacity duration-200 ${
            enlargedVisible ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeImage}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
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

          {/* Loading spinner for enlarged image */}
          {!enlargedImgLoaded && (
            <Loader2 size={40} className="animate-spin text-white/60 absolute" />
          )}

          {/* Image */}
          <img
            src={`/data/albums/${encodeURIComponent(state.album!)}/${images[state.imageIndex]}`}
            alt={`Foto ${state.imageIndex + 1} von ${images.length}`}
            className={`max-w-[90vw] max-h-[90vh] object-contain transition-opacity duration-200 ${
              enlargedImgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={e => e.stopPropagation()}
            onLoad={() => setEnlargedImgLoaded(true)}
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
