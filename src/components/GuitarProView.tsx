import { useEffect, useRef, useState } from 'react';
import * as alphaTab from '@coderline/alphatab';
import type { NotationMode } from '../types/models';

interface Track { index: number; name: string; program: number; }
interface Props { file: Blob; selectedTrackIds: number[]; notationMode: NotationMode; zoom: number; onTracks: (tracks: Track[]) => void; }

function barsPerRow(width: number): number {
  if (width < 520) return 2;
  if (width < 840) return 3;
  if (width < 1180) return 4;
  return 5;
}

function applyNotationMode(tracks: alphaTab.model.Track[], notationMode: NotationMode): void {
  for (const track of tracks) for (const staff of track.staves) {
    staff.showStandardNotation = notationMode !== 'tabs';
    staff.showTablature = notationMode !== 'standard';
  }
}
export function GuitarProView({ file, selectedTrackIds, notationMode, zoom, onTracks }: Props) {
  const host = useRef<HTMLDivElement>(null); const api = useRef<alphaTab.AlphaTabApi | null>(null); const [error, setError] = useState<string>(); const [loading, setLoading] = useState(true); const [rowBars, setRowBars] = useState(4);
  useEffect(() => {
    if (!host.current) return;
    const resize = () => setRowBars(barsPerRow(host.current?.clientWidth ?? 900));
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!host.current) return;
    try {
      setError(undefined); setLoading(true); host.current.replaceChildren();
      const instance = new alphaTab.AlphaTabApi(host.current, {
        core: { fontDirectory: `${import.meta.env.BASE_URL}alphatab/font/`, useWorkers: false },
        display: { layoutMode: alphaTab.LayoutMode.Page, scale: zoom, barsPerRow: rowBars, justifyLastSystem: true },
        player: { enablePlayer: false, enableCursor: false }
      });
      api.current = instance;
      instance.scoreLoaded.on(score => {
        onTracks(score.tracks.map((track, index) => ({ index, name: track.name || `Spur ${index + 1}`, program: track.playbackInfo.program })));
        const selected = selectedTrackIds.length ? score.tracks.filter(track => selectedTrackIds.includes(track.index)) : score.tracks;
        applyNotationMode(selected, notationMode);
        instance.renderTracks(selected);
      });
      instance.renderFinished.on(() => setLoading(false));
      instance.error.on(event => { console.error(event); setError('Die Guitar-Pro-Datei konnte nicht gelesen werden.'); setLoading(false); });
      void file.arrayBuffer().then(buffer => instance.load(new Uint8Array(buffer))).catch(cause => { console.error(cause); setError('Die Guitar-Pro-Datei konnte nicht gelesen werden.'); setLoading(false); });
    } catch (cause) { console.error(cause); setError('alphaTab konnte nicht initialisiert werden.'); }
    return () => { api.current?.destroy(); api.current = null; };
  }, [file, zoom, rowBars, onTracks]);
  useEffect(() => { const instance = api.current; if (instance?.score) { const selected = selectedTrackIds.length ? instance.score.tracks.filter(track => selectedTrackIds.includes(track.index)) : instance.score.tracks; applyNotationMode(selected, notationMode); instance.renderTracks(selected); } }, [selectedTrackIds, notationMode]);
  return <div className="document gp-document">{error ? <p className="reader-error">{error}</p> : <>{loading && <p className="reader-loading">Guitar-Pro-Partitur wird gerendert ...</p>}<div ref={host} className="gp-host" /></>}</div>;
}
