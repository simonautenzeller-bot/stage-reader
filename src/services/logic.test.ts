import { describe, expect, it } from 'vitest';
import { validateBackup } from './backup';
import { detectFile, titleFromFileName } from './files';
import { moveSong, offsetDistance, sortSongs } from './logic';
import type { Setlist, Song } from '../types/models';
const song = (id: string, title: string, importedAt: number): Song => ({ id, title, originalFileName: `${title}.pdf`, fileType: 'pdf', mimeType: 'application/pdf', fileBlob: new Blob(), fileSize: 1, importedAt, lastOpenedAt: null, isFavorite: false, currentPage: 1, scrollPosition: 0, zoomLevel: 1, displayMode: 'page', selectedTrackIds: [], notationMode: 'both' });
describe('Kernlogik', () => {
  it('erkennt unterstützte Formate und Titel', () => { expect(detectFile(new File(['x'], 'Probe.GP5'))?.type).toBe('guitar-pro'); expect(detectFile(new File(['x'], 'bild.png'))).toBeNull(); expect(titleFromFileName('Mein Song.pdf')).toBe('Mein Song'); });
  it('sortiert die Bibliothek nach Titel', () => { expect(sortSongs([song('1', 'Zulu', 1), song('2', 'Alpha', 2)], 'title').map(item => item.title)).toEqual(['Alpha', 'Zulu']); });
  it('verschiebt Einträge in einer Setliste', () => { const list: Setlist = { id: 's', title: 'Live', createdAt: 0, updatedAt: 0, orderedSongIds: ['a', 'b'] }; expect(moveSong(list, 0, 1).orderedSongIds).toEqual(['b', 'a']); });
  it('berechnet den Halbseiten-Schritt', () => { expect(offsetDistance(1000, 50)).toBe(500); expect(offsetDistance(1000, 40)).toBe(400); });
  it('akzeptiert nur versionierte Backups', () => { expect(() => validateBackup({ schema: 'stage-reader', version: 1, songs: [], setlists: [], settings: {} })).not.toThrow(); expect(() => validateBackup({ schema: 'other', version: 1 })).toThrow(); });
});
