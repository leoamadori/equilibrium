import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { EXERCISES, PDF_PATH } from '../data/exercises';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

interface PdfViewerProps {
  initialPage?: number;
}

export function PdfViewer({ initialPage = 1 }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPageNumber(initialPage);
  }, [initialPage]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const loadingTask = pdfjsLib.getDocument({ url: PDF_PATH });
    loadingTask.promise
      .then((doc) => {
        if (cancelled) {
          void doc.destroy();
          return;
        }
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError('Impossibile caricare il documento PDF locale.');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      void loadingTask.destroy();
    };
  }, []);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    let active = true;
    let renderTask: pdfjsLib.RenderTask | null = null;

    const clampedPage = Math.min(Math.max(1, pageNumber), pdfDoc.numPages);

    void pdfDoc.getPage(clampedPage).then((page) => {
      if (!active || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const baseViewport = page.getViewport({ scale: 1 });
      const containerWidth = Math.min(window.innerWidth - 36, 720);
      const fitScale = containerWidth / baseViewport.width;
      const effectiveScale = Math.max(0.5, Math.min(2.4, fitScale * zoom));
      const viewport = page.getViewport({ scale: effectiveScale });

      // Cap DPR to 2 to stay well below iOS Safari 16.7M pixel canvas limit
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      renderTask = page.render({ canvasContext: ctx, viewport });
      renderTask.promise.catch(() => {
        // Cancelled render on rapid page/zoom change
      });
    });

    return () => {
      active = false;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, pageNumber, zoom]);

  return (
    <div className="pdf-viewer">
      <div className="pdf-toolbar">
        <div className="pdf-nav-group">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
          >
            ◀ Prec.
          </button>
          <span className="pdf-page-indicator">
            Pag. {pageNumber} / {numPages || '…'}
          </span>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={numPages > 0 && pageNumber >= numPages}
            onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
          >
            Succ. ▶
          </button>
        </div>

        <div className="pdf-zoom-group">
          <button
            type="button"
            className="btn btn-secondary"
            aria-label="Riduci zoom"
            onClick={() => setZoom((z) => Math.max(0.7, Number((z - 0.15).toFixed(2))))}
          >
            −
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setZoom(1)}
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            aria-label="Aumenta zoom"
            onClick={() => setZoom((z) => Math.min(1.8, Number((z + 0.15).toFixed(2))))}
          >
            +
          </button>
        </div>
      </div>

      <div className="pdf-jump-bar" aria-label="Salta a esercizio">
        <button
          type="button"
          className={`chip ${pageNumber === 1 ? 'chip-active' : ''}`}
          onClick={() => setPageNumber(1)}
        >
          Indice
        </button>
        {EXERCISES.map((ex) => (
          <button
            key={ex.id}
            type="button"
            className={`chip ${pageNumber === ex.pdfPage ? 'chip-active' : ''}`}
            onClick={() => setPageNumber(ex.pdfPage)}
          >
            Es. {ex.number}
          </button>
        ))}
        <button
          type="button"
          className={`chip ${pageNumber === 20 ? 'chip-active' : ''}`}
          onClick={() => setPageNumber(20)}
        >
          Riepilogo
        </button>
      </div>

      {loading && <p className="muted-text">Caricamento PDF offline…</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="pdf-canvas-wrap">
        <canvas ref={canvasRef} className="pdf-canvas" />
      </div>
    </div>
  );
}
