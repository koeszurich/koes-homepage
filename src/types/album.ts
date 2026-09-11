/** Shapes returned by the gallery API of `api.koes.ch`. */

export type AlbumVisibility = 'public' | 'unlisted' | 'private';

export interface Album {
  id: string;
  /** URL slug; how an album is addressed by the API and in our own hash routes. */
  name: string;
  displayName: string;
  /** ISO date (`YYYY-MM-DD`) of the event the album belongs to. */
  date: string;
  description: string | null;
  visibility: AlbumVisibility;
  /** Number of images the caller may view, so it can differ from `images.length` never. */
  imageCount: number;
}

export interface AlbumImage {
  id: string;
  description: string | null;
  /** Display dimensions of the original, EXIF orientation already applied. */
  width: number;
  height: number;
  thumbnail: {
    width: number;
    height: number;
    /** Cache buster for the thumbnail URL, so a regenerated tile is picked up. */
    specVersion: number;
  };
}

/** What `GET /gallery/albums/{name}/images` answers with. */
export interface AlbumContents {
  album: Album;
  images: AlbumImage[];
}
