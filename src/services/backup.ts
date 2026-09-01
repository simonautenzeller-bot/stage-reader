import type { Backup, Settings, Setlist, Song } from '../types/models';
const schema = 'stage-reader';
export function createBackup(songs: Song[], setlists: Setlist[], settings: Settings): Backup {
  return { schema, version: 1, exportedAt: new Date().toISOString(), songs: songs.map(({ fileBlob: _fileBlob, ...song }) => song), setlists, settings };
}
export function validateBackup(input: unknown): Backup {
  if (!input || typeof input !== 'object') throw new Error('Die Backup-Datei ist kein gültiges JSON-Objekt.');
  const data = input as Partial<Backup>;
  if (data.schema !== schema || data.version !== 1) throw new Error('Dieses Backup stammt nicht von einer unterstützten Stage-Reader-Version.');
  if (!Array.isArray(data.songs) || !Array.isArray(data.setlists) || !data.settings) throw new Error('Das Backup enthält unvollständige Daten.');
  if (!data.songs.every(song => typeof song.id === 'string' && typeof song.title === 'string') || !data.setlists.every(list => typeof list.id === 'string' && Array.isArray(list.orderedSongIds))) throw new Error('Das Backup hat ein ungültiges Datenformat.');
  return data as Backup;
}
