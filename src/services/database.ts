import Dexie, { type Table } from 'dexie';
import type { Setlist, Settings, Song } from '../types/models';

export const defaultSettings: Settings = { id: 'global', appTheme: 'light', documentTheme: 'white', offsetStep: 50, reducedMotion: false };
class StageReaderDatabase extends Dexie {
  songs!: Table<Song, string>;
  setlists!: Table<Setlist, string>;
  settings!: Table<Settings, 'global'>;
  constructor() {
    super('stage-reader');
    this.version(1).stores({ songs: 'id, title, importedAt, lastOpenedAt, isFavorite, fileType', setlists: 'id, title, updatedAt', settings: 'id' });
    this.version(2).stores({ songs: 'id, title, importedAt, lastOpenedAt, isFavorite, fileType', setlists: 'id, title, updatedAt', settings: 'id' }).upgrade(async transaction => {
      const settings = transaction.table('settings');
      if (!(await settings.get('global'))) await settings.put(defaultSettings);
    });
    this.version(3).stores({ songs: 'id, title, originalFileName, importedAt, lastOpenedAt, isFavorite, fileType', setlists: 'id, title, updatedAt', settings: 'id' });
  }
}
export const db = new StageReaderDatabase();
export async function getSettings(): Promise<Settings> { return (await db.settings.get('global')) ?? defaultSettings; }
export async function findSongByOriginalFileName(originalFileName: string): Promise<Song | undefined> {
  return (await db.songs.toArray()).find(song => song.originalFileName === originalFileName);
}
export async function saveReadingPosition(id: string, updates: Pick<Song, 'currentPage' | 'scrollPosition' | 'zoomLevel' | 'displayMode' | 'selectedTrackIds' | 'notationMode'>): Promise<void> { await db.songs.update(id, updates); }
export async function storageEstimate(): Promise<{ usage?: number; quota?: number }> { return navigator.storage?.estimate ? navigator.storage.estimate() : {}; }
