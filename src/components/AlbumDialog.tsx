import { useEffect, useState, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Loader2, Calendar } from 'lucide-react';
import { useAlbum } from './AlbumProvider';
import { ApiError, fetchAlbums, fetchAlbumContents, imageUrl, thumbnailUrl } from '@/lib/galleryApi';
import type { Album, AlbumImage } from '@/types/album';
import { formatAlbumDate } from '@/lib/utils';

/** A single grid image that shows a placeholder until loaded. */
const GridImage = ({ src, alt, onClick }: { src: string; alt: string; onClick: () => void }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <button
      onClick={onClick}
      className="relative aspect-square overflow-hidden rounded-lg group focus:outline-none focus:ring-2 focus:ring-koes-red bg-gray-100"
    >
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-200 rounded-lg" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-110 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </button>
  );
};

/** Mobile tabs bar: horizontally scrollable with overflow arrow indicators. */
const MobileAlbumTabs = ({
  albums, selected, onSelect,
}: { albums: Album[]; selected: string; onSelect: (name: string) => void }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    return () => el.removeEventListener('scroll', checkScroll);
  }, [checkScroll, albums]);

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 180, behavior: 'smooth' });
  };

  return (
    <div className="relative md:hidden">
      {canScrollLeft && (
        <button
          onClick={() => scroll(-1)}
          className="absolute left-0 top-0 bottom-0 z-10 w-8 flex items-center justify-center bg-gradient-to-r from-white via-white/90 to-transparent"
          aria-label="Nach links scrollen"
        >
          <ChevronLeft size={18} className="text-gray-500" />
        </button>
      )}
      <div ref={scrollRef} className="overflow-x-auto scrollbar-hide">
        <div className="flex min-w-max">
          {albums.map(album => (
            <button
              key={album.name}
              onClick={() => onSelect(album.name)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                album.name === selected
                  ? 'border-koes-red text-koes-red'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {album.displayName}
            </button>
          ))}
        </div>
      </div>
      {canScrollRight && (
        <button
          onClick={() => scroll(1)}
          className="absolute right-0 top-0 bottom-0 z-10 w-8 flex items-center justify-center bg-gradient-to-l from-white via-white/90 to-transparent"
          aria-label="Nach rechts scrollen"
        >
          <ChevronRight size={18} className="text-gray-500" />
        </button>
      )}
    </div>
  );
};

const AlbumDialog = () => {
  const { state, openAlbum, openImage, closeDialog, closeImage } = useAlbum();
  const [albums, setAlbums] = useState<Album[]>([]);
  /**
   * Albums opened by URL that the API does not list: `unlisted` ones. Keeping
   * them here lets the sidebar show which album is open, and lets the visitor
   * return to it after looking at a listed album.
   */
  const [unlistedAlbums, setUnlistedAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [images, setImages] = useState<AlbumImage[]>([]);
  const [imagesError, setImagesError] = useState<'not_found' | 'failed' | null>(null);
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
      requestAnimationFrame(() => setOverlayVisible(false));
    }
  }, [isOpen]);

  // Animate enlarged view
  useEffect(() => {
    if (state.imageIndex !== null) {
      requestAnimationFrame(() => {
        setEnlargedImgLoaded(false);
        setEnlargedVisible(true);
      });
    } else {
      requestAnimationFrame(() => setEnlargedVisible(false));
    }
  }, [state.imageIndex]);

  // Fetch album list when dialog opens (cached)
  useEffect(() => {
    if (!isOpen) return;
    if (albums.length > 0) return;

    let cancelled = false;
    const doFetch = async () => {
      setLoadingAlbums(true);
      try {
        const data = await fetchAlbums();
        if (!cancelled) setAlbums(data);
      } catch {
        if (!cancelled) setAlbums([]);
      } finally {
        if (!cancelled) setLoadingAlbums(false);
      }
    };
    doFetch();
    return () => { cancelled = true; };
  }, [isOpen, albums.length]);

  // Fetch the selected album and its images (cached). The response carries the
  // album itself, which is what makes an unlisted album reachable by URL.
  useEffect(() => {
    const album = state.album;
    if (!album) {
      prevAlbumRef.current = null;
      return;
    }
    if (album === prevAlbumRef.current) return;
    prevAlbumRef.current = album;

    let cancelled = false;
    const doFetch = async () => {
      setImageGridVisible(false);
      setLoadingImages(true);
      setImagesError(null);
      setSelectedAlbum(null);
      setImages([]);
      try {
        const contents = await fetchAlbumContents(album);
        if (cancelled) return;
        setSelectedAlbum(contents.album);
        setImages(contents.images);
        if (contents.album.visibility !== 'public') {
          setUnlistedAlbums(prev =>
            prev.some(a => a.name === contents.album.name) ? prev : [contents.album, ...prev],
          );
        }
        requestAnimationFrame(() => { if (!cancelled) setImageGridVisible(true); });
      } catch (error) {
        if (cancelled) return;
        setImages([]);
        setImagesError(error instanceof ApiError && error.status === 404 ? 'not_found' : 'failed');
        setImageGridVisible(true);
      } finally {
        if (!cancelled) setLoadingImages(false);
      }
    };
    doFetch();
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
    if (delta > SWIPE_THRESHOLD) handlePrev();
    else if (delta < -SWIPE_THRESHOLD) handleNext();
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

  const sidebarAlbums = [
    ...unlistedAlbums.filter(album => !albums.some(listed => listed.name === album.name)),
    ...albums,
  ];
  const enlargedImage = state.imageIndex !== null ? images[state.imageIndex] : undefined;

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
              Fotos
            </h3>
            <button
              onClick={closeDialog}
              className="text-gray-500 hover:text-koes-red transition-colors text-2xl leading-none"
              aria-label="Schließen"
            >
              <X size={24} />
            </button>
          </div>

          {/* Mobile: Tabs with overflow arrows */}
          {!loadingAlbums && sidebarAlbums.length > 0 && (
            <MobileAlbumTabs
              albums={sidebarAlbums}
              selected={state.album!}
              onSelect={openAlbum}
            />
          )}

          {/* Body: sidebar (desktop) + grid */}
          <div className="flex flex-1 overflow-hidden">
            {/* Desktop sidebar */}
            <div className="hidden md:flex flex-col w-56 shrink-0 border-r overflow-y-auto">
              {loadingAlbums ? (
                <div className="flex items-center gap-2 text-gray-400 text-sm p-4">
                  <Loader2 size={14} className="animate-spin" />
                  Laden...
                </div>
              ) : (
                sidebarAlbums.map(album => (
                  <button
                    key={album.name}
                    onClick={() => openAlbum(album.name)}
                    className={`px-4 py-3 text-sm text-left transition-colors border-l-2 ${
                      album.name === state.album
                        ? 'border-koes-red bg-red-50 text-koes-red font-semibold'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {album.displayName}
                  </button>
                ))
              )}
            </div>

            {/* Album details + image grid. Sitting inside this pane puts them
                below the mobile tabs and beside the desktop sidebar. */}
            <div className="p-4 overflow-y-auto flex-1">
              {selectedAlbum && !imagesError && (
                <div className="mb-4">
                  {selectedAlbum.description && (
                    <p className="text-gray-600 whitespace-pre-line">{selectedAlbum.description}</p>
                  )}
                  <div className={`flex items-center text-koes-red ${selectedAlbum.description ? 'mt-2' : ''}`}>
                    <Calendar size={16} className="mr-2 shrink-0" />
                    <span className="font-medium">{formatAlbumDate(selectedAlbum.date)}</span>
                  </div>
                </div>
              )}
              {loadingImages ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 size={32} className="animate-spin text-koes-red" />
                  <span className="text-gray-400">Fotos werden geladen...</span>
                </div>
              ) : imagesError !== null || images.length === 0 ? (
                <div className="flex items-center justify-center py-16">
                  <span className="text-gray-400">
                    {imagesError === 'not_found'
                      ? 'Dieses Album gibt es nicht.'
                      : imagesError === 'failed'
                        ? 'Die Fotos konnten nicht geladen werden.'
                        : 'Keine Fotos vorhanden.'}
                  </span>
                </div>
              ) : (
                <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 transition-opacity duration-300 ${
                  imageGridVisible ? 'opacity-100' : 'opacity-0'
                }`}>
                  {images.map((image, index) => (
                    <GridImage
                      key={image.id}
                      src={thumbnailUrl(image)}
                      alt={image.description ?? `Foto ${index + 1}`}
                      onClick={() => state.album && openImage(state.album, index)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Enlarged image overlay */}
      {enlargedImage && (
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
          {state.imageIndex! > 0 && (
            <button
              onClick={e => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors z-10 bg-black/30 rounded-full p-2"
              aria-label="Vorheriges Foto"
            >
              <ChevronLeft size={32} />
            </button>
          )}

          {/* Next button */}
          {state.imageIndex! < images.length - 1 && (
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

          {/* Image: the original, the one place a thumbnail is not enough. */}
          <img
            src={imageUrl(enlargedImage)}
            alt={enlargedImage.description ?? `Foto ${state.imageIndex! + 1} von ${images.length}`}
            className={`max-w-[90vw] max-h-[90vh] object-contain transition-opacity duration-200 ${
              enlargedImgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={e => e.stopPropagation()}
            onLoad={() => setEnlargedImgLoaded(true)}
          />

          {/* Image counter + album name */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center text-white/70 text-sm gap-2">
            <span className="truncate max-w-[60%]">{selectedAlbum?.displayName || state.album}</span>
            <span className="shrink-0">{state.imageIndex! + 1} / {images.length}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default AlbumDialog;
