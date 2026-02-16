import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

interface AlbumState {
  /** Currently open album name (null = dialog closed) */
  album: string | null;
  /** Currently enlarged image index (null = grid view) */
  imageIndex: number | null;
}

interface AlbumContextType {
  state: AlbumState;
  openAlbum: (albumName: string) => void;
  openImage: (albumName: string, index: number) => void;
  closeDialog: () => void;
  closeImage: () => void;
}

const AlbumContext = createContext<AlbumContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAlbum = () => {
  const context = useContext(AlbumContext);
  if (!context) {
    throw new Error('useAlbum must be used within an AlbumProvider');
  }
  return context;
};

const FOTOS_PREFIX = '#fotos/';

function parseHash(hash: string): AlbumState {
  if (!hash.startsWith(FOTOS_PREFIX)) {
    return { album: null, imageIndex: null };
  }
  const rest = hash.slice(FOTOS_PREFIX.length);
  const parts = rest.split('/');
  const albumName = decodeURIComponent(parts[0]);
  if (!albumName) {
    return { album: null, imageIndex: null };
  }
  if (parts.length >= 2) {
    const idx = parseInt(parts[1], 10);
    if (!isNaN(idx) && idx >= 0) {
      return { album: albumName, imageIndex: idx };
    }
  }
  return { album: albumName, imageIndex: null };
}

function buildHash(state: AlbumState): string {
  if (!state.album) return '';
  const encoded = encodeURIComponent(state.album);
  if (state.imageIndex !== null) {
    return `${FOTOS_PREFIX}${encoded}/${state.imageIndex}`;
  }
  return `${FOTOS_PREFIX}${encoded}`;
}

interface AlbumProviderProps {
  children: ReactNode;
}

const AlbumProvider = ({ children }: AlbumProviderProps) => {
  const [state, setState] = useState<AlbumState>(() => parseHash(window.location.hash));

  const updateState = useCallback((newState: AlbumState) => {
    setState(newState);
    const hash = buildHash(newState);
    if (hash) {
      window.history.replaceState(null, '', hash);
    } else {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  const openAlbum = useCallback((albumName: string) => {
    updateState({ album: albumName, imageIndex: null });
  }, [updateState]);

  const openImage = useCallback((albumName: string, index: number) => {
    updateState({ album: albumName, imageIndex: index });
  }, [updateState]);

  const closeDialog = useCallback(() => {
    updateState({ album: null, imageIndex: null });
  }, [updateState]);

  const closeImage = useCallback(() => {
    setState(prev => {
      const newState = { album: prev.album, imageIndex: null };
      const hash = buildHash(newState);
      if (hash) {
        window.history.replaceState(null, '', hash);
      }
      return newState;
    });
  }, []);

  // Listen for popstate (browser back/forward)
  useEffect(() => {
    const handleHashChange = () => {
      setState(parseHash(window.location.hash));
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <AlbumContext.Provider value={{ state, openAlbum, openImage, closeDialog, closeImage }}>
      {children}
    </AlbumContext.Provider>
  );
};

export default AlbumProvider;
