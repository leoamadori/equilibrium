import { WEEKLY_TARGET_MAX, WEEKLY_TARGET_MIN } from '../data/exercises';
import type { SessionRecord } from '../types/storage';
import { computeStats, formatDuration, formatMinutesLabel } from '../utils/stats';

interface StatsPageProps {
  sessions: SessionRecord[];
}

export function StatsPage({ sessions }: StatsPageProps) {
  const summary = computeStats(sessions);
  const progressPct = Math.min(100, Math.round((summary.weekSessionsCount / WEEKLY_TARGET_MIN) * 100));

  return (
    <section className="page stats-page">
      <h1>Statistiche</h1>

      <div className="card">
        <h2>Settimana corrente (Lun–Dom)</h2>
        <div className="stats-grid">
          <div className="stat-box">
            <strong>{summary.weekSessionsCount}</strong>
            <span>Sessioni (target {WEEKLY_TARGET_MIN}–{WEEKLY_TARGET_MAX})</span>
          </div>
          <div className="stat-box">
            <strong>{formatMinutesLabel(summary.weekDurationSec)}</strong>
            <span>Tempo settimanale</span>
          </div>
          <div className="stat-box">
            <strong>{summary.totalSessionsCount}</strong>
            <span>Sessioni totali</span>
          </div>
          <div className="stat-box">
            <strong>{formatMinutesLabel(summary.totalDurationSec)}</strong>
            <span>Tempo complessivo</span>
          </div>
        </div>

        <div className="progress-bar-wrap" aria-label="Progresso settimanale">
          <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <p className="muted-text">
          {summary.weekSessionsCount >= WEEKLY_TARGET_MIN
            ? 'Obiettivo settimanale minimo raggiunto.'
            : `Mancano ${WEEKLY_TARGET_MIN - summary.weekSessionsCount} sessioni al minimo settimanale consigliato.`}
        </p>
      </div>

      <div className="card">
        <h2>Storico Sessioni</h2>
        {sessions.length === 0 ? (
          <p className="muted-text">Nessuna sessione registrata su questo dispositivo.</p>
        ) : (
          <ul className="history-list">
            {sessions.map((s) => {
              const dt = new Date(s.startedAt);
              const dateStr = Number.isNaN(dt.getTime())
                ? s.startedAt
                : dt.toLocaleString('it-IT', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
              return (
                <li key={s.id} className="history-item">
                  <div>
                    <strong>{dateStr}</strong>
                    <span className="muted-text">
                      {s.completedExercises}/{s.totalExercises} esercizi{' '}
                      {s.completed ? '(Completa)' : '(Parziale)'}
                    </span>
                  </div>
                  <span className="history-duration">{formatDuration(s.durationSec)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
