export type FileType = 'pdf' | 'guitar-pro';
export type DisplayMode = 'page' | 'offset' | 'continuous';
export type NotationMode = 'standard' | 'tabs' | 'both';
export type AppTheme = 'dark' | 'light' | 'system';
export type DocumentTheme = 'white' | 'warm' | 'dark';

export interface Song {
  id: string; title: string; originalFileName: string; fileType: FileType; mimeType: string;
  fileBlob: Blob; fileSize: number; importedAt: number; lastOpenedAt: number | null;
  isFavorite: boolean; currentPage: number; scrollPosition: number; zoomLevel: number;
  displayMode: DisplayMode; selectedTrackIds: number[]; notationMode: NotationMode; notes?: string;
}
export interface Setlist { id: string; title: string; createdAt: number; updatedAt: number; orderedSongIds: string[]; }
export interface Settings { id: 'global'; appTheme: AppTheme; documentTheme: DocumentTheme; offsetStep: 40 | 50 | 60 | 75 | 100; reducedMotion: boolean; }
export interface DetectedFile { type: FileType; mimeType: string; }
export interface Backup { schema: 'stage-reader'; version: 1; exportedAt: string; songs: Omit<Song, 'fileBlob'>[]; setlists: Setlist[]; settings: Settings; }
