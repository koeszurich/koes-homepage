import type { Album, AlbumContents, AlbumImage } from '@/types/album';

/** Same API host as the WhatsApp endpoint. */
const API_BASE = 'https://api.koes.ch';

/**
 * Responses are kept for the lifetime of the page: the listings are small and
 * the preview tiles and the dialog ask for the same albums repeatedly, so
 * without this every tile rotation would hit the network again.
 */
const cache = new Map<string, Promise<unknown>>();

/** An API response that was not a success, kept apart so `404` can be told from a network failure. */
export class ApiError extends Error {
  constructor(readonly status: number) {
    super(`Gallery API responded with ${status}`);
    this.name = 'ApiError';
  }
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new ApiError(response.status);
  }
  return response.json() as Promise<T>;
}

function fetchCached<T>(path: string): Promise<T> {
  const cached = cache.get(path);
  if (cached) {
    return cached as Promise<T>;
  }
  // The promise is cached rather than its value, so parallel callers share one
  // request; a failed one is evicted so the next caller retries.
  const pending = fetchJson<T>(path).catch(error => {
    cache.delete(path);
    throw error;
  });
  cache.set(path, pending);
  return pending;
}

/** The API speaks `snake_case`; the components do not. */
interface AlbumJson {
  id: string;
  name: string;
  display_name: string;
  date: string;
  description: string | null;
  visibility: Album['visibility'];
  image_count: number;
}

interface AlbumImageJson {
  id: string;
  description: string | null;
  width: number;
  height: number;
  thumbnail: { width: number; height: number; spec_version: number };
}

function toAlbum(json: AlbumJson): Album {
  return {
    id: json.id,
    name: json.name,
    displayName: json.display_name,
    date: json.date,
    description: json.description,
    visibility: json.visibility,
    imageCount: json.image_count,
  };
}

function toAlbumImage(json: AlbumImageJson): AlbumImage {
  return {
    id: json.id,
    description: json.description,
    width: json.width,
    height: json.height,
    thumbnail: {
      width: json.thumbnail.width,
      height: json.thumbnail.height,
      specVersion: json.thumbnail.spec_version,
    },
  };
}

/** The albums the API lists, in the order it returns them. */
export async function fetchAlbums(): Promise<Album[]> {
  const data = await fetchCached<{ albums: AlbumJson[] }>('/gallery/albums');
  return data.albums.map(toAlbum);
}

/**
 * One album with its images. The album is part of the response, which is what
 * makes an `unlisted` album reachable by URL although it never appears in
 * {@link fetchAlbums}. Throws {@link ApiError} with `404` for an album that does
 * not exist or may not be viewed.
 */
export async function fetchAlbumContents(name: string): Promise<AlbumContents> {
  const data = await fetchCached<{ album: AlbumJson; images: AlbumImageJson[] }>(
    `/gallery/albums/${encodeURIComponent(name)}/images`,
  );
  return { album: toAlbum(data.album), images: data.images.map(toAlbumImage) };
}

/** The stored original, for the enlarged view only. */
export function imageUrl(image: AlbumImage): string {
  return `${API_BASE}/gallery/images/${image.id}`;
}

/**
 * The small derivative every grid and preview tile loads instead of the
 * original. `v` is the thumbnail version the API reports for the image;
 * tiles are cached aggressively, so a regenerated one is only picked up
 * because that version changes the URL.
 */
export function thumbnailUrl(image: AlbumImage): string {
  return `${API_BASE}/gallery/images/${image.id}/thumbnail?v=${image.thumbnail.specVersion}`;
}
