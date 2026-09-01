import { useEffect, useRef, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;
interface Props { file: Blob; page: number; zoom: number; mode: 'page' | 'offset' | 'continuous'; documentTheme: string; onPages: (count: number) => void; }
export function PdfView({ file, page, zoom, mode, documentTheme, onPages }: Props) {
  const host = useRef<HTMLDivElement>(null); const [error, setError] = useState<string>();
  useEffect(() => {
    let cancelled = false; const canvases: HTMLCanvasElement[] = [];
    async function render() {
      try {
        setError(undefined); host.current?.replaceChildren();
        const pdfDocument = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
        if (cancelled) return; onPages(pdfDocument.numPages);
        const pages = mode === 'continuous' ? Array.from({ length: pdfDocument.numPages }, (_, index) => index + 1) : [page];
        for (const number of pages) {
          const pdfPage = await pdfDocument.getPage(number); if (cancelled) return;
          const viewport = pdfPage.getViewport({ scale: zoom * devicePixelRatio });
          const canvas = document.createElement('canvas'); canvas.width = viewport.width; canvas.height = viewport.height;
          canvas.style.width = `${viewport.width / devicePixelRatio}px`; canvas.style.height = `${viewport.height / devicePixelRatio}px`;
          canvas.setAttribute('aria-label', `PDF-Seite ${number}`); host.current?.append(canvas); canvases.push(canvas);
          await pdfPage.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise;
        }
      } catch (cause) { console.error(cause); if (!cancelled) setError('Die PDF konnte nicht dargestellt werden. Die Datei ist möglicherweise beschädigt.'); }
    }
    void render(); return () => { cancelled = true; canvases.forEach(canvas => canvas.remove()); };
  }, [file, page, zoom, mode, onPages]);
  return <div className={`document pdf-document document-${documentTheme}`}>{error ? <p className="reader-error">{error}</p> : <div ref={host} className="pdf-pages" />}</div>;
}
