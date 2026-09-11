import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format an album's `YYYY-MM-DD` date the way the site writes dates elsewhere,
 * e.g. `27. März 2025`. The parts are read by hand rather than through
 * `new Date(iso)`, which would parse the date as UTC midnight and show the day
 * before in timezones behind UTC. An unparseable date is returned unchanged.
 */
export function formatAlbumDate(date: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (!match) {
    return date
  }
  const [, year, month, day] = match
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString('de-CH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
