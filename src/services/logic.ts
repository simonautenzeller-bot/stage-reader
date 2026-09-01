import type { Setlist, Song } from '../types/models';
export type SortOrder = 'title' | 'opened' | 'imported' | 'type';
export function sortSongs(songs: Song[], order: SortOrder): Song[] {
  return [...songs].sort((left, right) => {
    if (order === 'title') return left.title.localeCompare(right.title, 'de');
    if (order === 'type') return left.fileType.localeCompare(right.fileType);
    const key = order === 'opened' ? 'lastOpenedAt' : 'importedAt';
    return (right[key] ?? 0) - (left[key] ?? 0);
  });
}
export function offsetDistance(viewportHeight: number, percentage: number): number { return Math.max(1, Math.round(viewportHeight * percentage / 100)); }
export function moveSong(setlist: Setlist, index: number, direction: -1 | 1): Setlist {
  const target = index + direction;
  if (target < 0 || target >= setlist.orderedSongIds.length) return setlist;
  const ids = [...setlist.orderedSongIds]; [ids[index], ids[target]] = [ids[target], ids[index]];
  return { ...setlist, orderedSongIds: ids, updatedAt: Date.now() };
}
export function downloadBlob(blob: Blob, name: string): void { const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click(); URL.revokeObjectURL(url); }
