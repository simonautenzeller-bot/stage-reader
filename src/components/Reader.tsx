import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { db, getSettings, saveReadingPosition } from '../services/database';
import { offsetDistance } from '../services/logic';
import type { DisplayMode, NotationMode, Setlist, Song } from '../types/models';
import { PdfView } from './PdfView';
import { GuitarProView } from './GuitarProView';

const readerVersion = 'v2026.09.04.1';

export function Reader() {
  const { id } = useParams(); const navigate = useNavigate(); const [searchParams] = useSearchParams(); const [song, setSong] = useState<Song>(); const [setlist, setSetlist] = useState<Setlist>(); const [pages, setPages] = useState(1); const [menu, setMenu] = useState(true); const [documentTheme, setDocumentTheme] = useState('white'); const [offsetStep, setOffsetStep] = useState(50); const [tracks, setTracks] = useState<{ index: number; name: string; program: number }[]>([]); const container = useRef<HTMLDivElement>(null); const header = useRef<HTMLElement>(null); const pointer = useRef<{ x: number; y: number; scrollTop: number; multi: boolean } | undefined>(undefined);
  useEffect(() => { void (async () => { const loaded = id ? await db.songs.get(id) : undefined; if (!loaded) { navigate('/'); return; } const listId = searchParams.get('setlist'); setSetlist(listId ? await db.setlists.get(listId) : undefined); const settings = await getSettings(); setDocumentTheme(settings.documentTheme); setOffsetStep(settings.offsetStep); const updated = { ...loaded, lastOpenedAt: Date.now() }; await db.songs.put(updated); setSong(updated); try { await navigator.wakeLock?.request('screen'); } catch { /* optional browser feature */ } })(); }, [id, navigate, searchParams]);
  const update = (changes: Partial<Song>) => { if (!song) return; const next = { ...song, ...changes }; setSong(next); void saveReadingPosition(next.id, next); };
  const scrollDistance = (percentage: number) => offsetDistance(container.current?.clientHeight ?? innerHeight, percentage);
  const gpPageDistance = () => Math.max(1, (container.current?.clientHeight ?? innerHeight) - (header.current?.offsetHeight ?? 0));
  const visibleGpBounds = () => { const readerRect = container.current?.getBoundingClientRect(); const top = (readerRect?.top ?? 0) + (header.current?.offsetHeight ?? 0); return { top, bottom: readerRect?.bottom ?? innerHeight, height: Math.max(1, (readerRect?.bottom ?? innerHeight) - top) }; };
  const gpRenderBlocks = () => {
    const documentRoot = container.current?.querySelector('.gp-document');
    if (!documentRoot) return [];
    const hostRoot = documentRoot.querySelector('.gp-host');
    const hostWidth = hostRoot?.getBoundingClientRect().width ?? documentRoot.getBoundingClientRect().width;
    const rowCandidates = Array.from(documentRoot.querySelectorAll<Element>('svg g, .at-system')).filter(element => {
      const rect = element.getBoundingClientRect();
      return rect.width >= hostWidth * 0.45 && rect.height >= 18 && rect.height <= innerHeight * 0.55;
    });
    if (rowCandidates.length) return rowCandidates;
    const directBlocks = hostRoot ? Array.from(hostRoot.children) : [];
    const selector = 'svg, canvas, .at-surface, .at-page, [data-layout-partial]';
    const nestedBlocks = Array.from(documentRoot.querySelectorAll<Element>(selector));
    const blocks = [...directBlocks, ...nestedBlocks].filter(element => { const rect = element.getBoundingClientRect(); return rect.width > 40 && rect.height > 12; });
    return blocks.length ? blocks : Array.from(documentRoot.children);
  };
  const scrollGuitarPro = (direction: -1 | 1) => {
    const reader = container.current;
    if (!reader) return;
    const bounds = visibleGpBounds();
    const visibleBlocks = gpRenderBlocks().map(element => ({ element, rect: element.getBoundingClientRect() })).filter(({ rect }) => rect.bottom > bounds.top + 1 && rect.top < bounds.bottom - 1).sort((left, right) => left.rect.top - right.rect.top);
    if (!visibleBlocks.length) { reader.scrollBy({ top: direction * gpPageDistance(), behavior: 'auto' }); return; }
    if (direction > 0) {
      const anchor = [...visibleBlocks].reverse().find(({ rect }) => rect.top > bounds.top + 8) ?? visibleBlocks[visibleBlocks.length - 1];
      const delta = anchor.rect.top - bounds.top;
      reader.scrollBy({ top: Math.abs(delta) > 1 ? delta : gpPageDistance(), behavior: 'auto' });
      return;
    }
    const anchor = visibleBlocks.find(({ rect }) => rect.bottom < bounds.bottom - 8) ?? visibleBlocks[0];
    const targetTop = bounds.bottom - Math.min(anchor.rect.height, bounds.height);
    const delta = anchor.rect.top - targetTop;
    reader.scrollBy({ top: Math.abs(delta) > 1 ? delta : -gpPageDistance(), behavior: 'auto' });
  };
  const go = (direction: -1 | 1) => { if (!song) return; const motion = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'; if (song.fileType === 'guitar-pro') { scrollGuitarPro(direction); return; } if (song.displayMode === 'continuous') { container.current?.scrollBy({ top: direction * scrollDistance(75), behavior: motion }); return; } if (song.displayMode === 'offset') { container.current?.scrollBy({ top: direction * scrollDistance(offsetStep), behavior: motion }); return; } update({ currentPage: Math.max(1, Math.min(pages, song.currentPage + direction)) }); };
  useEffect(() => { const keyboard = (event: KeyboardEvent) => { if (event.key === 'Escape') menu ? setMenu(false) : navigate('/'); if (['ArrowRight', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); go(1); } if (['ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); go(-1); } }; addEventListener('keydown', keyboard); return () => removeEventListener('keydown', keyboard); });
  if (!song) return <main className="reader-loading">Partitur wird geöffnet ...</main>;
  const setlistIndex = setlist && song ? setlist.orderedSongIds.indexOf(song.id) : -1;
  const openSetlistSong = (direction: -1 | 1) => { if (!setlist || setlistIndex < 0) return; const nextId = setlist.orderedSongIds[setlistIndex + direction]; if (nextId) navigate(`/reader/${nextId}?setlist=${setlist.id}`); };
  const zoomPercent = Math.round(song.zoomLevel * 100);
  const setZoomPercent = (value: number) => update({ zoomLevel: Math.min(2, Math.max(0.5, value / 100)) });
  const onPointerUp = (event: React.PointerEvent) => { const start = pointer.current; const reader = container.current; if (!start || !reader || start.multi || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 12 || Math.abs(reader.scrollTop - start.scrollTop) > 2 || event.currentTarget !== event.target && (event.target as Element).closest('.reader-menu')) return; const rect = reader.getBoundingClientRect(); go(event.clientX < rect.left + rect.width / 2 ? -1 : 1); };
  return <main className="reader" ref={container} onScroll={() => song.displayMode === 'continuous' && update({ scrollPosition: container.current?.scrollTop ?? 0 })} onPointerDown={event => { pointer.current = { x: event.clientX, y: event.clientY, scrollTop: container.current?.scrollTop ?? 0, multi: event.isPrimary === false }; }} onPointerUp={onPointerUp}>
    <header ref={header} className="reader-menu" onPointerDown={event => event.stopPropagation()} onPointerUp={event => event.stopPropagation()}><div className="reader-controls" hidden={!menu}><button onClick={() => navigate('/')}>Bibliothek</button>{setlist && <><button disabled={setlistIndex <= 0} onClick={() => openSetlistSong(-1)}>Vorheriger Song</button><span>{setlistIndex + 1} von {setlist.orderedSongIds.length}</span><button disabled={setlistIndex >= setlist.orderedSongIds.length - 1} onClick={() => openSetlistSong(1)}>Nächster Song</button></>}<strong>{song.title}</strong><label>Modus <select value={song.displayMode} onChange={event => update({ displayMode: event.target.value as DisplayMode })}><option value="page">Seite</option><option value="offset">Halbe Seite</option><option value="continuous">Endlos</option></select></label><label className="zoom-control">Zoom <input type="range" min="0.5" max="2" step="0.01" value={song.zoomLevel} onChange={event => update({ zoomLevel: Number(event.target.value) })} /><input className="zoom-percent" type="number" min="50" max="200" step="1" value={zoomPercent} onChange={event => setZoomPercent(Number(event.target.value))} aria-label="Zoom in Prozent" /><span>%</span></label>{song.fileType === 'guitar-pro' && <><label>Notation <select value={song.notationMode} onChange={event => update({ notationMode: event.target.value as NotationMode })}><option value="both">Beides</option><option value="standard">Notation</option><option value="tabs">Tabulatur</option></select></label><label>Spuren <select multiple value={song.selectedTrackIds.map(String)} onChange={event => update({ selectedTrackIds: Array.from(event.target.selectedOptions, option => Number(option.value)) })}>{tracks.map(track => <option key={track.index} value={track.index}>{track.name}</option>)}</select></label></>}<button onClick={() => update({ zoomLevel: 1 })}>Zurücksetzen</button></div><div className="reader-nav"><span className="reader-version">Version {readerVersion}</span><button aria-expanded={menu} onClick={() => setMenu(!menu)}>Menü</button></div></header>
    {song.fileType === 'pdf' ? <PdfView file={song.fileBlob} page={song.currentPage} zoom={song.zoomLevel} mode={song.displayMode} documentTheme={documentTheme} onPages={setPages} /> : <GuitarProView file={song.fileBlob} zoom={song.zoomLevel} selectedTrackIds={song.selectedTrackIds} notationMode={song.notationMode} onTracks={setTracks} />}
  </main>;
}
