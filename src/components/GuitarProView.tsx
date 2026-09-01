import { useEffect, useRef, useState } from 'react';
import * as alphaTab from '@coderline/alphatab';
import type { NotationMode } from '../types/models';

interface Track { index: number; name: string; program: number; }
interface Props { file: Blob; selectedTrackIds: number[]; notationMode: NotationMode; zoom: number; onTracks: (tracks: Track[]) => void; }
export function GuitarProView({ file, selectedTrackIds, notationMode, zoom, onTracks }: Props) {
  const host = useRef<HTMLDivElement>(null); const api = useRef<alphaTab.AlphaTabApi | null>(null); const [error, setError] = useState<string>(); const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!host.current) return;
    try {
      setError(undefined); setLoading(true); host.current.replaceChildren();
      const instance = new alphaTab.AlphaTabApi(host.current, {
        core: { fontDirectory: `${import.meta.env.BASE_URL}alphatab/font/`, scriptFile: `${import.meta.env.BASE_URL}alphatab/alphaTab.mjs` },
        display: { layoutMode: alphaTab.LayoutMode.Horizontal, scale: zoom },
        player: { enablePlayer: false, enableCursor: false }
      });
      api.current = instance;
      instance.scoreLoaded.on(score => { onTracks(score.tracks.map((track, index) => ({ index, name: track.name || `Spur ${index + 1}`, program: track.playbackInfo.program }))); setLoading(false); });
      instance.error.on(event => { console.error(event); setError('Die Guitar-Pro-Datei konnte nicht gelesen werden.'); });
      void file.arrayBuffer().then(buffer => instance.load(new Uint8Array(buffer)));
    } catch (cause) { console.error(cause); setError('alphaTab konnte nicht initialisiert werden.'); }
    return () => { api.current?.destroy(); api.current = null; };
  }, [file, zoom, onTracks]);
  useEffect(() => { const instance = api.current; if (instance?.score) { const selected = selectedTrackIds.length ? instance.score.tracks.filter(track => selectedTrackIds.includes(track.index)) : instance.score.tracks; instance.renderTracks(selected); } }, [selectedTrackIds, notationMode]);
  return <div className="document gp-document">{error ? <p className="reader-error">{error}</p> : <>{loading && <p className="reader-loading">Guitar-Pro-Partitur wird gerendert ...</p>}<div ref={host} /></>}</div>;
}
