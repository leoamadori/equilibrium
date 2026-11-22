import type { Exercise, ExerciseLevelConfig, TrainingLevel } from '../types/exercise';
import type { CountdownState } from '../hooks/useTimers';
import { formatDuration } from '../utils/stats';

interface TvModeViewProps {
  exercise: Exercise;
  levelConfig: ExerciseLevelConfig;
  trainingLevel: TrainingLevel;
  index: number;
  total: number;
  sessionElapsedSec: number;
  countdown: CountdownState;
  audioPlaying: boolean;
  onStartWork: () => void;
  onStartRest: () => void;
  onReplayAudio: () => void;
  onPrev: () => void;
  onNext: () => void;
  onExitTv: () => void;
}

export function TvModeView({
  exercise,
  levelConfig,
  trainingLevel,
  index,
  total,
  sessionElapsedSec,
  countdown,
  audioPlaying,
  onStartWork,
  onStartRest,
  onReplayAudio,
  onPrev,
  onNext,
  onExitTv,
}: TvModeViewProps) {
  return (
    <div className="tv-overlay" role="region" aria-label="Modalità TV">
      <div className="tv-topbar">
        <div className="tv-topbar-left">
          <span className="tv-badge">
            ES. {index + 1}/{total} • {trainingLevel === 'facile' ? 'FACILE' : 'ALLENATO'}
          </span>
          <span className="tv-session-time">Sessione: {formatDuration(sessionElapsedSec)}</span>
        </div>
        <button type="button" className="btn btn-tv-exit btn-sm" onClick={onExitTv}>
          Esci TV
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
          <div className="tv-header-block">
            <h1 className="tv-title">{exercise.title}</h1>
            <p className="tv-dosage">{levelConfig.summary}</p>
          </div>

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
            <div className="tv-timer-top">
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
                  {countdown.completed
                    ? 'Timer terminato!'
                    : countdown.activeLabel ?? `Timer Es. ${exercise.number}`}
                </span>
              </div>
              <div className="tv-timer-value">
                {countdown.activeLabel
                  ? formatDuration(countdown.remainingSec)
                  : formatDuration(levelConfig.workSec ?? levelConfig.restSec)}
              </div>
            </div>

            {countdown.completed ? (
              <div className="tv-presets">
                {countdown.activeKind === 'work' ? (
                  <button type="button" className="btn btn-tv-preset-rest" onClick={onStartRest}>
                    ▶ Avvia Pausa ({levelConfig.restSec}s)
                  </button>
                ) : (
                  levelConfig.workSec && (
                    <button type="button" className="btn btn-tv-preset-work" onClick={onStartWork}>
                      ▶ Ripeti Esercizio ({levelConfig.workSec}s)
                    </button>
                  )
                )}
                <button type="button" className="btn btn-tv-nav-primary" onClick={onNext}>
                  {index + 1 < total ? 'Prossimo Esercizio ▶' : 'Completa ✓'}
                </button>
              </div>
            ) : (
              <div className="tv-presets">
                {levelConfig.workSec && (
                  <button type="button" className="btn btn-tv-preset-work" onClick={onStartWork}>
                    ▶ Esercizio ({levelConfig.workSec}s)
                  </button>
                )}
                <button type="button" className="btn btn-tv-preset-rest" onClick={onStartRest}>
                  ⏸ Pausa ({levelConfig.restSec}s)
                </button>
                {countdown.activeLabel && (
                  <button type="button" className="btn btn-tv-preset" onClick={countdown.toggle}>
                    {countdown.running ? 'Ferma' : 'Riprendi'}
                  </button>
                )}
              </div>
            )}
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
              ◀ Prec.
            </button>
            <button type="button" className="btn btn-tv-audio" onClick={onReplayAudio}>
              {audioPlaying ? '🔊 Guida…' : '🔊 Riascolta'}
            </button>
            <button type="button" className="btn btn-tv-nav-primary" onClick={onNext}>
              {index + 1 < total ? 'Succ. ▶' : 'Fine ✓'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
