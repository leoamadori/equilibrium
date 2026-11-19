import { useState } from 'react';
import { EXERCISES } from '../data/exercises';
import { PdfViewer } from '../components/PdfViewer';

type GuideTab = 'cards' | 'pdf';

export function GuidePage() {
  const [tab, setTab] = useState<GuideTab>('cards');
  const [expandedId, setExpandedId] = useState<string | null>(EXERCISES[0].id);
  const [pdfPage, setPdfPage] = useState<number>(1);

  const openInPdf = (page: number) => {
    setPdfPage(page);
    setTab('pdf');
  };

  return (
    <section className="page guide-page">
      <div className="page-header">
        <h1>Guida agli Esercizi</h1>
        <div className="segmented" role="tablist" aria-label="Modalità lettura guida">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'cards'}
            className={`segmented-btn ${tab === 'cards' ? 'segmented-btn-active' : ''}`}
            onClick={() => setTab('cards')}
          >
            Schede Interattive
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'pdf'}
            className={`segmented-btn ${tab === 'pdf' ? 'segmented-btn-active' : ''}`}
            onClick={() => setTab('pdf')}
          >
            PDF Originale
          </button>
        </div>
      </div>

      {tab === 'cards' ? (
        <div className="guide-list">
          {EXERCISES.map((ex) => {
            const isOpen = expandedId === ex.id;
            return (
              <article key={ex.id} className={`exercise-card ${isOpen ? 'exercise-card-open' : ''}`}>
                <button
                  type="button"
                  className="exercise-card-header"
                  aria-expanded={isOpen}
                  onClick={() => setExpandedId(isOpen ? null : ex.id)}
                >
                  <img
                    src={ex.imagePath}
                    alt={ex.title}
                    className="exercise-thumb"
                    loading="lazy"
                  />
                  <div className="exercise-card-summary">
                    <span className="badge-num">Scheda {ex.number} di 6</span>
                    <h2>{ex.title}</h2>
                    <p className="muted-text">{ex.loadParams[0]?.value}</p>
                  </div>
                  <span className="chevron" aria-hidden="true">
                    {isOpen ? '▲' : '▼'}
                  </span>
                </button>

                {isOpen && (
                  <div className="exercise-card-body">
                    <div className="video-container">
                      <video
                        src={ex.videoPath}
                        poster={ex.imagePath}
                        className="exercise-video"
                        autoPlay
                        loop
                        muted
                        playsInline
                        controls
                      />
                    </div>

                    <div className="callout callout-objective">
                      <strong>Obiettivo:</strong> {ex.objective}
                    </div>

                    <h3>Parametri di Carico</h3>
                    <table className="params-table">
                      <tbody>
                        {ex.loadParams.map((row) => (
                          <tr key={row.label}>
                            <th>{row.label}</th>
                            <td>{row.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <h3>Esecuzione Passo-Passo</h3>
                    <ol className="steps-list">
                      {ex.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>

                    <div className="callout callout-neutral">
                      <strong>Target Muscolare e Articolare:</strong> {ex.targetMuscles}
                    </div>

                    <div className="callout callout-warning">
                      <strong>Errori Comuni</strong>
                      <ul>
                        {ex.commonErrors.map((err) => (
                          <li key={err}>{err}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="callout callout-info">
                      <p>
                        <strong>Facile (Regressione):</strong> {ex.easyLevel}
                      </p>
                      <p>
                        <strong>Avanzato (Progressione):</strong> {ex.advancedLevel}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => openInPdf(ex.pdfPage)}
                    >
                      Apri nel PDF a pagina {ex.pdfPage}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <PdfViewer initialPage={pdfPage} />
      )}
    </section>
  );
}
