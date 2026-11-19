import type { Exercise } from '../types/exercise';
import type { CountdownState } from '../hooks/useTimers';
import { formatDuration } from '../utils/stats';

interface TvModeViewProps {
  exercise: Exercise;
  index: number;
  total: number;
  sessionElapsedSec: number;
  countdown: CountdownState;
  audioPlaying: boolean;
  onReplayAudio: () => void;
  onPrev: () => void;
  onNext: () => void;
  onExitTv: () => void;
}

export function TvModeView({
  exercise,
  index,
  total,
  sessionElapsedSec,
  countdown,
  audioPlaying,
  onReplayAudio,
  onPrev,
  onNext,
  onExitTv,
}: TvModeViewProps) {
  return (
    <div className="tv-overlay" role="region" aria-label="Modalità TV">
      <div className="tv-topbar">
        <span className="tv-badge">
          ESERCIZIO {index + 1} / {total}
        </span>
        <span className="tv-session-time">Sessione: {formatDuration(sessionElapsedSec)}</span>
        <button type="button" className="btn btn-tv-exit" onClick={onExitTv}>
          Esci da Modalità TV
        </button>
      </div>

      <div className="tv-grid">
        <div className="tv-media-col">
          <video
            key={exercise.videoPath}
            src={exercise.videoPath}
            poster={exercise.imagePath}
            className="tv-video"
            autoPlay
            loop
            muted
            playsInline
          />
        </div>

        <div className="tv-info-col">
          <h1 className="tv-title">{exercise.title}</h1>
          <p className="tv-subtitle">{exercise.subtitle}</p>

          <div
            className={`tv-timer-box ${
              countdown.activeKind === 'work'
                ? 'tv-timer-work'
                : countdown.activeKind === 'rest'
                  ? 'tv-timer-rest'
                  : ''
            } ${countdown.finishedFlash ? 'timer-flash' : ''}`}
            aria-live="polite"
          >
            <div className="tv-timer-header">
              {countdown.activeKind && (
                <span
                  className={`timer-kind-badge ${
                    countdown.activeKind === 'work' ? 'badge-work' : 'badge-rest'
                  }`}
                >
                  {countdown.activeKind === 'work' ? 'ESERCIZIO' : 'PAUSA'}
                </span>
              )}
              <span className="tv-timer-label">
                {countdown.activeLabel ?? `Timer esercizio ${exercise.number}`}
              </span>
            </div>
            <div className="tv-timer-value">
              {countdown.activeLabel
                ? formatDuration(countdown.remainingSec)
                : formatDuration(exercise.timerPresets[0]?.durationSec ?? 30)}
            </div>
            <div className="tv-presets">
              {exercise.timerPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={`btn ${
                    preset.kind === 'work' ? 'btn-tv-preset-work' : 'btn-tv-preset-rest'
                  }`}
                  onClick={() =>
                    countdown.startPreset(preset.durationSec, preset.label, preset.kind)
                  }
                >
                  {preset.label}
                </button>
              ))}
              {countdown.activeLabel && (
                <button
                  type="button"
                  className="btn btn-tv-preset"
                  onClick={countdown.toggle}
                >
                  {countdown.running ? 'Pausa' : 'Riprendi'}
                </button>
              )}
            </div>
          </div>

          <ul className="tv-points">
            {exercise.tvPoints.map((pt) => (
              <li key={pt}>{pt}</li>
            ))}
          </ul>

          <div className="tv-controls">
            <button
              type="button"
              className="btn btn-tv-nav"
              disabled={index === 0}
              onClick={onPrev}
            >
              ◀ Precedente
            </button>
            <button type="button" className="btn btn-tv-audio" onClick={onReplayAudio}>
              {audioPlaying ? '🔊 In riproduzione…' : '🔊 Riascolta'}
            </button>
            <button type="button" className="btn btn-tv-nav-primary" onClick={onNext}>
              {index + 1 < total ? 'Successivo ▶' : 'Termina ✓'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
