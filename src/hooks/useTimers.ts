import { useCallback, useEffect, useRef, useState } from 'react';
import { beepEngine } from '../services/beepEngine';
import { timerWakeAdapter } from '../platform/adapter';

export interface StopwatchState {
  elapsedSec: number;
  running: boolean;
  start: () => void;
  pause: () => void;
  toggle: () => void;
  reset: () => void;
}

export function useStopwatch(autoStart = false): StopwatchState {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [running, setRunning] = useState(autoStart);
  const lastTickRef = useRef<number | null>(autoStart ? Date.now() : null);

  useEffect(() => {
    if (!running) {
      lastTickRef.current = null;
      return;
    }
    lastTickRef.current = Date.now();
    const id = window.setInterval(() => {
      const now = Date.now();
      const prev = lastTickRef.current ?? now;
      const delta = Math.max(0, now - prev);
      lastTickRef.current = now;
      setElapsedMs((ms) => ms + delta);
    }, 250);
    return () => window.clearInterval(id);
  }, [running]);

  const start = useCallback(() => {
    lastTickRef.current = Date.now();
    setRunning(true);
  }, []);

  const pause = useCallback(() => {
    if (lastTickRef.current !== null) {
      const delta = Math.max(0, Date.now() - lastTickRef.current);
      setElapsedMs((ms) => ms + delta);
      lastTickRef.current = null;
    }
    setRunning(false);
  }, []);

  const toggle = useCallback(() => {
    setRunning((prev) => {
      if (prev) {
        if (lastTickRef.current !== null) {
          const delta = Math.max(0, Date.now() - lastTickRef.current);
          setElapsedMs((ms) => ms + delta);
          lastTickRef.current = null;
        }
        return false;
      }
      lastTickRef.current = Date.now();
      return true;
    });
  }, []);

  const reset = useCallback(() => {
    lastTickRef.current = null;
    setRunning(false);
    setElapsedMs(0);
  }, []);

  return {
    elapsedSec: Math.floor(elapsedMs / 1000),
    running,
    start,
    pause,
    toggle,
    reset,
  };
}

export type TimerKind = 'work' | 'rest';

export interface CountdownState {
  remainingSec: number;
  initialSec: number;
  activeLabel: string | null;
  activeKind: TimerKind | null;
  running: boolean;
  completed: boolean;
  finishedFlash: boolean;
  startPreset: (durationSec: number, label: string, kind: TimerKind) => void;
  toggle: () => void;
  pause: () => void;
  reset: () => void;
  clear: () => void;
}

export function useCountdown(): CountdownState {
  const [initialSec, setInitialSec] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [activeKind, setActiveKind] = useState<TimerKind | null>(null);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [finishedFlash, setFinishedFlash] = useState(false);

  const endAtMsRef = useRef<number | null>(null);
  const lastBeepSecRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) {
      endAtMsRef.current = null;
      return;
    }

    const id = window.setInterval(() => {
      const endAt = endAtMsRef.current;
      if (endAt === null) return;
      const next = Math.max(0, endAt - Date.now());
      const nextSec = Math.ceil(next / 1000);

      setRemainingMs(next);

      if (next === 0) {
        endAtMsRef.current = null;
        setRunning(false);
        setCompleted(true);
        setFinishedFlash(true);
        beepEngine.playComplete();
        timerWakeAdapter.pulseOnFinish();
        void timerWakeAdapter.cancelTimerEnd();
        window.setTimeout(() => setFinishedFlash(false), 2200);
        lastBeepSecRef.current = 0;
      } else if (nextSec >= 1 && nextSec <= 3 && lastBeepSecRef.current !== nextSec) {
        lastBeepSecRef.current = nextSec;
        beepEngine.playTick();
      }
    }, 150);

    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    return () => {
      void timerWakeAdapter.cancelTimerEnd();
    };
  }, []);

  const startPreset = useCallback((durationSec: number, label: string, kind: TimerKind) => {
    beepEngine.unlock();
    const safeSec = Math.max(1, Math.floor(durationSec));
    const endAt = Date.now() + safeSec * 1000;
    endAtMsRef.current = endAt;
    setInitialSec(safeSec);
    setRemainingMs(safeSec * 1000);
    setActiveLabel(label);
    setActiveKind(kind);
    setCompleted(false);
    setFinishedFlash(false);
    lastBeepSecRef.current = null;
    setRunning(true);
    void timerWakeAdapter.scheduleTimerEnd(endAt, label);
  }, []);

  const pause = useCallback(() => {
    if (endAtMsRef.current !== null) {
      setRemainingMs(Math.max(0, endAtMsRef.current - Date.now()));
      endAtMsRef.current = null;
    }
    setRunning(false);
    void timerWakeAdapter.cancelTimerEnd();
  }, []);

  const toggle = useCallback(() => {
    beepEngine.unlock();
    if (running) {
      pause();
      return;
    }
    const baseMs = remainingMs <= 0 && initialSec > 0 ? initialSec * 1000 : remainingMs;
    if (baseMs > 0) {
      const endAt = Date.now() + baseMs;
      endAtMsRef.current = endAt;
      setRemainingMs(baseMs);
      setCompleted(false);
      lastBeepSecRef.current = null;
      setRunning(true);
      void timerWakeAdapter.scheduleTimerEnd(endAt, activeLabel ?? 'Timer');
    }
  }, [running, pause, remainingMs, initialSec, activeLabel]);

  const reset = useCallback(() => {
    endAtMsRef.current = null;
    lastBeepSecRef.current = null;
    setRunning(false);
    setCompleted(false);
    setFinishedFlash(false);
    setRemainingMs(initialSec * 1000);
    void timerWakeAdapter.cancelTimerEnd();
  }, [initialSec]);

  const clear = useCallback(() => {
    endAtMsRef.current = null;
    lastBeepSecRef.current = null;
    setRunning(false);
    setCompleted(false);
    setFinishedFlash(false);
    setInitialSec(0);
    setRemainingMs(0);
    setActiveLabel(null);
    setActiveKind(null);
    void timerWakeAdapter.cancelTimerEnd();
  }, []);

  return {
    remainingSec: Math.ceil(remainingMs / 1000),
    initialSec,
    activeLabel,
    activeKind,
    running,
    completed,
    finishedFlash,
    startPreset,
    toggle,
    pause,
    reset,
    clear,
  };
}
