import { WEEKLY_TARGET_MAX, WEEKLY_TARGET_MIN } from '../data/exercises';
import type { RouteName } from '../router';
import type { SessionRecord } from '../types/storage';
import { computeStats, formatMinutesLabel } from '../utils/stats';

interface HomePageProps {
  sessions: SessionRecord[];
  onNavigate: (route: RouteName) => void;
}

export function HomePage({ sessions, onNavigate }: HomePageProps) {
  const stats = computeStats(sessions);

  return (
    <section className="page home-page">
      <div className="hero-card">
        <span className="hero-eyebrow">PROGRAMMA CORPO LIBERO • 6 ESERCIZI</span>
        <h1 className="hero-title">Equilibrium</h1>
        <p className="hero-desc">
          Circuito pratico da 15–20 minuti per stabilità articolare, propriocezione e controllo
          motorio quotidiano.
        </p>
        <div className="hero-meta">
          <div>
            <strong>{stats.weekSessionsCount} / {WEEKLY_TARGET_MIN}–{WEEKLY_TARGET_MAX}</strong>
            <span>Sessioni settimana</span>
          </div>
          <div>
            <strong>{formatMinutesLabel(stats.weekDurationSec)}</strong>
            <span>Tempo settimana</span>
          </div>
          <div>
            <strong>{stats.totalSessionsCount}</strong>
            <span>Totale sessioni</span>
          </div>
        </div>
      </div>

      <div className="home-primary-actions">
        <button
          type="button"
          className="action-tile action-tile-primary"
          onClick={() => onNavigate('sessione')}
        >
          <span className="action-tile-icon" aria-hidden="true">▶</span>
          <span className="action-tile-body">
            <strong>Inizia Sessione</strong>
            <span>Allenamento guidato con voce, animazioni, timer e Modalità TV</span>
          </span>
        </button>

        <button
          type="button"
          className="action-tile"
          onClick={() => onNavigate('guida')}
        >
          <span className="action-tile-icon" aria-hidden="true">📖</span>
          <span className="action-tile-body">
            <strong>Leggi la Guida</strong>
            <span>6 schede interattive con errori comuni, livelli e PDF originale</span>
          </span>
        </button>
      </div>

      <div className="home-secondary-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => onNavigate('statistiche')}
        >
          Statistiche
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => onNavigate('impostazioni')}
        >
          Impostazioni e Promemoria
        </button>
      </div>
    </section>
  );
}
