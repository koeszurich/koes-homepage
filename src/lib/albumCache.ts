import type { AlbumEntry } from '@/types/album';

const cache = new Map<string, unknown>();

async function fetchCached<T>(url: string): Promise<T> {
  if (cache.has(url)) {
    return cache.get(url) as T;
  }
  const res = await fetch(url);
  const data: T = await res.json();
  cache.set(url, data);
  return data;
}

export async function fetchAlbumList(): Promise<AlbumEntry[]> {
  return fetchCached<AlbumEntry[]>('/data/albums/index.json');
}

export async function fetchAlbumImages(albumName: string): Promise<string[]> {
  return fetchCached<string[]>(`/data/albums/${encodeURIComponent(albumName)}/index.json`);
}
