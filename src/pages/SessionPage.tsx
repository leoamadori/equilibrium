import { useCallback, useEffect, useRef, useState } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { EXERCISES } from '../data/exercises';
import {
  isNativeAndroid,
  orientationAdapter,
  wakeLockAdapter,
} from '../platform/adapter';
import { audioCoach } from '../services/audioCoach';
import { beepEngine } from '../services/beepEngine';
import { useCountdown, useStopwatch } from '../hooks/useTimers';
import type { TrainingLevel } from '../types/exercise';
import type { AudioMode, SessionRecord } from '../types/storage';
import type { RouteName } from '../router';
import { formatDuration } from '../utils/stats';
import { TvModeView } from '../components/TvModeView';

interface SessionPageProps {
  defaultAudioMode: AudioMode;
  defaultTrainingLevel: TrainingLevel;
  onChangeTrainingLevel: (level: TrainingLevel) => void;
  onSaveSession: (record: SessionRecord) => void;
  onNavigate: (route: RouteName) => void;
  onTvModeChange: (active: boolean) => void;
}

type SessionPhase = 'intro' | 'active' | 'summary';
type LevelTab = 'base' | 'easy' | 'advanced';

export function SessionPage({
  defaultAudioMode,
  defaultTrainingLevel,
  onChangeTrainingLevel,
  onSaveSession,
  onNavigate,
  onTvModeChange,
}: SessionPageProps) {
  const [phase, setPhase] = useState<SessionPhase>('intro');
  const [index, setIndex] = useState(0);
  const [audioMode, setAudioMode] = useState<AudioMode>(defaultAudioMode);
  const [trainingLevel, setTrainingLevel] = useState<TrainingLevel>(defaultTrainingLevel);
  const [levelTab, setLevelTab] = useState<LevelTab>('base');
  const [tvMode, setTvMode] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [savedSummary, setSavedSummary] = useState<SessionRecord | null>(null);

  const startedAtRef = useRef<string>(new Date().toISOString());
  const visitedSetRef = useRef<Set<number>>(new Set([0]));
  const touchStartXRef = useRef<number | null>(null);

  const stopwatch = useStopwatch(false);
  const countdown = useCountdown();
  const exercise = EXERCISES[index];
  const levelCfg = exercise.levels[trainingLevel];

  useEffect(() => {
    setAudioMode(defaultAudioMode);
  }, [defaultAudioMode]);

  useEffect(() => {
    setTrainingLevel(defaultTrainingLevel);
  }, [defaultTrainingLevel]);

  useEffect(() => {
    return audioCoach.subscribe(setAudioPlaying);
  }, []);

  useEffect(() => {
    const activeTv = tvMode && phase === 'active';
    onTvModeChange(activeTv);
    if (activeTv) {
      void orientationAdapter.lockLandscape();
    } else {
      void orientationAdapter.unlock();
    }
  }, [tvMode, phase, onTvModeChange]);

  // Wake Lock active throughout active session (and especially TV Mode)
  useEffect(() => {
    if (phase === 'active') {
      void wakeLockAdapter.enable();
      return () => {
        void wakeLockAdapter.disable();
      };
    }
    return undefined;
  }, [phase]);

  // Pause voice when tab/app goes hidden (keep running countdown alive so screen can wake on end)
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && phase === 'active') {
        audioCoach.pause();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [phase]);

  // Cleanup audio and orientation on unmount
  useEffect(() => {
    return () => {
      audioCoach.stop();
      onTvModeChange(false);
      void orientationAdapter.unlock();
    };
  }, [onTvModeChange]);

  const playForExercise = useCallback(
    (exIndex: number, mode: AudioMode, forcePlay = false) => {
      const target = EXERCISES[exIndex];
      if (!target) return;
      if (mode === 'off' && !forcePlay) {
        audioCoach.stop();
        return;
      }
      const src = mode === 'full' ? target.audioFullPath : target.audioShortPath;
      audioCoach.playTrack(src);
    },
    [],
  );

  const handleSelectLevel = (level: TrainingLevel) => {
    setTrainingLevel(level);
    onChangeTrainingLevel(level);
  };

  const handleStartSession = () => {
    audioCoach.unlock();
    beepEngine.unlock();
    startedAtRef.current = new Date().toISOString();
    visitedSetRef.current = new Set([0]);
    setIndex(0);
    setLevelTab(trainingLevel === 'facile' ? 'easy' : 'base');
    countdown.clear();
    setPhase('active');
    stopwatch.reset();
    stopwatch.start();
    playForExercise(0, audioMode);
  };

  const finishSession = useCallback(
    (markAllDone = false) => {
      stopwatch.pause();
      countdown.clear();
      audioCoach.stop();
      setTvMode(false);

      const visitedCount = markAllDone
        ? EXERCISES.length
        : Math.min(EXERCISES.length, visitedSetRef.current.size);
      const durationSec = stopwatch.elapsedSec;

      const record: SessionRecord = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        startedAt: startedAtRef.current,
        endedAt: new Date().toISOString(),
        durationSec,
        completedExercises: visitedCount,
        totalExercises: EXERCISES.length,
        completed: visitedCount === EXERCISES.length,
      };

      if (durationSec >= 5 || visitedCount >= 1) {
        onSaveSession(record);
      }
      setSavedSummary(record);
      setPhase('summary');
    },
    [countdown, onSaveSession, stopwatch],
  );

  const goToIndex = useCallback(
    (nextIndex: number) => {
      if (nextIndex < 0) return;
      if (nextIndex >= EXERCISES.length) {
        finishSession(true);
        return;
      }
      visitedSetRef.current.add(nextIndex);
      setIndex(nextIndex);
      setLevelTab(trainingLevel === 'facile' ? 'easy' : 'base');
      countdown.clear();
      playForExercise(nextIndex, audioMode);
    },
    [audioMode, countdown, finishSession, playForExercise, trainingLevel],
  );

  const startWorkTimer = useCallback(() => {
    if (levelCfg.workSec) {
      countdown.startPreset(levelCfg.workSec, `Esercizio ${levelCfg.workSec}s`, 'work');
    }
  }, [countdown, levelCfg.workSec]);

  const startRestTimer = useCallback(() => {
    countdown.startPreset(levelCfg.restSec, `Pausa ${levelCfg.restSec}s`, 'rest');
  }, [countdown, levelCfg.restSec]);

  // Android hardware back button guard during active session
  useEffect(() => {
    if (!isNativeAndroid() || phase !== 'active') return undefined;
    let handle: { remove: () => Promise<void> } | null = null;
    void CapacitorApp.addListener('backButton', () => {
      if (tvMode) {
        setTvMode(false);
        return;
      }
      if (window.confirm('Vuoi terminare e salvare la sessione in corso?')) {
        finishSession(false);
      }
    }).then((h) => {
      handle = h;
    });
    return () => {
      if (handle) void handle.remove();
    };
  }, [phase, tvMode, finishSession]);

  // Keyboard shortcuts for PC / HDMI / Bluetooth remote
  useEffect(() => {
    if (phase !== 'active') return undefined;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT')
      ) {
        return;
      }

      if (e.code === 'ArrowRight') {
        e.preventDefault();
        goToIndex(index + 1);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        goToIndex(index - 1);
      } else if (e.code === 'Space') {
        if (target?.tagName === 'BUTTON') return;
        e.preventDefault();
        if (countdown.activeLabel && !countdown.completed) {
          countdown.toggle();
        } else if (countdown.completed && countdown.activeKind === 'work') {
          startRestTimer();
        } else if (levelCfg.workSec) {
          startWorkTimer();
        } else {
          startRestTimer();
        }
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        playForExercise(index, audioMode, true);
      } else if (e.code === 'KeyT') {
        e.preventDefault();
        setTvMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    phase,
    index,
    audioMode,
    countdown,
    levelCfg.workSec,
    goToIndex,
    playForExercise,
    startRestTimer,
    startWorkTimer,
  ]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
    const delta = endX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (Math.abs(delta) > 70) {
      if (delta < 0) {
        goToIndex(index + 1);
      } else if (index > 0) {
        goToIndex(index - 1);
      }
    }
  };

  if (phase === 'intro') {
    return (
      <section className="page session-intro">
        <div className="card">
          <span className="badge-num">PRIMA DI INIZIARE</span>
          <h1>Preparazione alla Sessione</h1>
          <div className="callout callout-warning">
            <strong>Sicurezza:</strong> assicurati di avere una sedia stabile o una parete a portata
            di mano come appoggio. Allenati preferibilmente a piedi scalzi o con calze antiscivolo
            su pavimento stabile.
          </div>

          <div className="form-group">
            <label className="form-label">Scegli il livello della sessione</label>
            <div className="level-choice-grid">
              <button
                type="button"
                className={`level-choice-card ${
                  trainingLevel === 'facile' ? 'level-choice-active' : ''
                }`}
                onClick={() => handleSelectLevel('facile')}
              >
                <strong>Facile</strong>
                <span>Tenute 20s • Pause 45–60s • Meno serie</span>
              </button>
              <button
                type="button"
                className={`level-choice-card ${
                  trainingLevel === 'allenato' ? 'level-choice-active' : ''
                }`}
                onClick={() => handleSelectLevel('allenato')}
              >
                <strong>Allenato</strong>
                <span>Tenute 30s • Pause 30–45s • Serie complete</span>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Voce guida allenatore</label>
            <div className="segmented">
              {(['short', 'full', 'off'] as AudioMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`segmented-btn ${audioMode === mode ? 'segmented-btn-active' : ''}`}
                  onClick={() => setAudioMode(mode)}
                >
                  {mode === 'short' ? 'Sintetica' : mode === 'full' ? 'Completa' : 'Spento'}
                </button>
              ))}
            </div>
          </div>

          <button type="button" className="btn btn-primary btn-lg" onClick={handleStartSession}>
            Inizia Sessione
          </button>
        </div>
      </section>
    );
  }

  if (phase === 'summary' && savedSummary) {
    return (
      <section className="page session-summary">
        <div className="card">
          <span className="badge-num">SESSIONE SALVATA</span>
          <h1>{savedSummary.completed ? 'Circuito completato' : 'Sessione terminata'}</h1>
          <div className="summary-metrics">
            <div>
              <strong>{formatDuration(savedSummary.durationSec)}</strong>
              <span>Durata</span>
            </div>
            <div>
              <strong>
                {savedSummary.completedExercises} / {savedSummary.totalExercises}
              </strong>
              <span>Esercizi</span>
            </div>
          </div>
          <div className="summary-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigate('statistiche')}
            >
              Vai alle Statistiche
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onNavigate('home')}
            >
              Torna alla Home
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (tvMode) {
    return (
      <TvModeView
        exercise={exercise}
        levelConfig={levelCfg}
        trainingLevel={trainingLevel}
        index={index}
        total={EXERCISES.length}
        sessionElapsedSec={stopwatch.elapsedSec}
        countdown={countdown}
        audioPlaying={audioPlaying}
        onStartWork={startWorkTimer}
        onStartRest={startRestTimer}
        onReplayAudio={() => playForExercise(index, audioMode, true)}
        onPrev={() => goToIndex(index - 1)}
        onNext={() => goToIndex(index + 1)}
        onExitTv={() => setTvMode(false)}
      />
    );
  }

  return (
    <section
      className="page session-page"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="session-topbar">
        <span className="badge-num">
          Es. {index + 1}/{EXERCISES.length} • {trainingLevel === 'facile' ? 'Facile' : 'Allenato'}
        </span>
        <div className="stopwatch-pill" title="Durata totale sessione per le statistiche">
          <span>⏱ {formatDuration(stopwatch.elapsedSec)}</span>
          <button type="button" className="btn-link" onClick={stopwatch.toggle}>
            {stopwatch.running ? 'Pausa' : 'Riprendi'}
          </button>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setTvMode(true)}
        >
          📺 Modalità TV
        </button>
      </div>

      <div className="card session-card">
        <div className="session-heading">
          <h1>{exercise.title}</h1>
          <p className="level-summary-line">{levelCfg.summary}</p>
        </div>

        <div className="video-container">
          <video
            key={exercise.videoPath}
            src={exercise.videoPath}
            poster={exercise.imagePath}
            className="exercise-video"
            autoPlay
            loop
            muted
            playsInline
          />
        </div>

        <div className="audio-bar">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => playForExercise(index, audioMode, true)}
          >
            {audioPlaying ? '🔊 Riascolta' : '🔊 Ascolta guida'}
          </button>
          <div className="segmented segmented-compact">
            {(['short', 'full', 'off'] as AudioMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                className={`segmented-btn ${audioMode === mode ? 'segmented-btn-active' : ''}`}
                onClick={() => {
                  setAudioMode(mode);
                  if (mode === 'off') {
                    audioCoach.stop();
                  } else {
                    playForExercise(index, mode, true);
                  }
                }}
              >
                {mode === 'short' ? 'Sintetica' : mode === 'full' ? 'Completa' : 'Spento'}
              </button>
            ))}
          </div>
        </div>

        <div
          className={`timer-panel ${
            countdown.activeKind === 'work'
              ? 'timer-work'
              : countdown.activeKind === 'rest'
                ? 'timer-rest'
                : ''
          } ${countdown.finishedFlash ? 'timer-flash' : ''}`}
        >
          <div className="timer-header">
            <div className="timer-title-wrap">
              {countdown.activeKind && (
                <span
                  className={`timer-kind-badge ${
                    countdown.activeKind === 'work' ? 'badge-work' : 'badge-rest'
                  }`}
                >
                  {countdown.activeKind === 'work' ? 'ESERCIZIO' : 'PAUSA'}
                </span>
              )}
              <span className="timer-title">
                {countdown.completed
                  ? `${countdown.activeLabel} terminato!`
                  : countdown.activeLabel ?? `Timer esercizio ${exercise.number}`}
              </span>
            </div>
            <span className="timer-readout">
              {countdown.activeLabel
                ? formatDuration(countdown.remainingSec)
                : formatDuration(levelCfg.workSec ?? levelCfg.restSec)}
            </span>
          </div>

          {countdown.completed ? (
            <div className="timer-next-step">
              {countdown.activeKind === 'work' ? (
                <>
                  <button
                    type="button"
                    className="btn btn-rest-cta btn-lg"
                    onClick={startRestTimer}
                  >
                    Avvia Pausa ({levelCfg.restSec}s)
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => goToIndex(index + 1)}
                  >
                    {index + 1 < EXERCISES.length ? 'Prossimo Esercizio ▶' : 'Completa ✓'}
                  </button>
                </>
              ) : (
                <>
                  {levelCfg.workSec && (
                    <button
                      type="button"
                      className="btn btn-primary btn-lg"
                      onClick={startWorkTimer}
                    >
                      Ripeti Esercizio ({levelCfg.workSec}s)
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    onClick={() => goToIndex(index + 1)}
                  >
                    {index + 1 < EXERCISES.length ? 'Prossimo Esercizio ▶' : 'Completa ✓'}
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="timer-single-actions">
              {levelCfg.workSec && (
                <button
                  type="button"
                  className={`btn btn-work-action ${
                    countdown.activeKind === 'work' ? 'btn-work-action-active' : ''
                  }`}
                  onClick={startWorkTimer}
                >
                  ▶ Esercizio ({levelCfg.workSec}s)
                </button>
              )}
              <button
                type="button"
                className={`btn btn-rest-action ${
                  countdown.activeKind === 'rest' ? 'btn-rest-action-active' : ''
                }`}
                onClick={startRestTimer}
              >
                ⏸ Pausa ({levelCfg.restSec}s)
              </button>
              {countdown.activeLabel && (
                <>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={countdown.toggle}
                  >
                    {countdown.running ? 'Ferma' : 'Riprendi'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={countdown.reset}
                  >
                    Reset
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="level-tabs">
          <div className="segmented">
            <button
              type="button"
              className={`segmented-btn ${levelTab === 'base' ? 'segmented-btn-active' : ''}`}
              onClick={() => setLevelTab('base')}
            >
              Base
            </button>
            <button
              type="button"
              className={`segmented-btn ${levelTab === 'easy' ? 'segmented-btn-active' : ''}`}
              onClick={() => setLevelTab('easy')}
            >
              Facile
            </button>
            <button
              type="button"
              className={`segmented-btn ${levelTab === 'advanced' ? 'segmented-btn-active' : ''}`}
              onClick={() => setLevelTab('advanced')}
            >
              Avanzato
            </button>
          </div>
          <div className="level-panel">
            {levelTab === 'base' && (
              <ol className="steps-list">
                {exercise.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            )}
            {levelTab === 'easy' && <p>{exercise.easyLevel}</p>}
            {levelTab === 'advanced' && <p>{exercise.advancedLevel}</p>}
          </div>
        </div>
      </div>

      <div className="session-nav">
        <button
          type="button"
          className="btn btn-secondary btn-lg"
          disabled={index === 0}
          onClick={() => goToIndex(index - 1)}
        >
          ◀ Precedente
        </button>
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={() => goToIndex(index + 1)}
        >
          {index + 1 < EXERCISES.length ? 'Successivo ▶' : 'Completa ✓'}
        </button>
      </div>

      <div className="session-footer-stop">
        <button
          type="button"
          className="btn-link btn-danger-text"
          onClick={() => finishSession(false)}
        >
          Termina sessione ora e salva
        </button>
      </div>
    </section>
  );
}
